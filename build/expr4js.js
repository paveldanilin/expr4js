/***********************************************************************************************************************
* Expr4JS v0.1
***********************************************************************************************************************/

(function () {

  var expr4js = (function () {

    var _extends = function(child, parent) {

      child.prototype = Object.create(parent.prototype);

    };

    
    var OPERATOR = {
      GT:         100, // >
      LT:         101, // <
      GET:        102, // >=
      LET:        103, // <=
      EQ:         104, // ==
      NEQ:        105, // !=
      DOT:        106, // .
      WS:         107, // ' '
      AND:        108, // and
      OR:         109, // or
      DIV:        110, // /
      DIF:        111, // -
      MUL:        112, // *
      SUM:        113, // +
      OPEN_PAR:   114, // (
      CLOSE_PAR:  115, // )
      IN:         116, // ? (const) ? (object/const[string])
      COMMA:      117,
      MOD:        118, // %
      NOT:        119, // !
      QUOTE_SINGLE: 120, // '
      QUOTE_DOUBLE: 121, // "
      INC:         122, // ++
      DEC:         123 // --
    };
    
    var DATA_TYPE = {
      STRING: 1,
      NUMBER: 2
    };
    
    var _keywords = {
      'in': 1
    };
    var _stopchars = ['?', '!', '=', '>', '<', '"', '\'', '.', ' ', '(', ')', ',', '*', '+', '-', '%'];
    var _precedence = {
      '(': 1,
      ')': 2,
      '||': 3, 'or': 3,
      '&&': 4, 'and': 4,
      '<': 5, '>': 5, '<=': 5, '>=': 5, '==': 5, '!=': 5, '?': 5,
      '+':  6, '-': 6,
      '*':  7, '/': 7, '%': 7,
      '.': 8
    };
    
    var LEX_ERROR = {
    
      PARSE_STRING     : {
    
        CODE: 1000,
    
        MSG: 'Unable to parse string'
    
      },
    
      UNKNOWN_OPERATOR : {
    
        CODE: 1001,
    
        MSG: 'Unknown operator'
    
      },
    
      BAD_NUMBER       : {
    
        CODE: 1002,
    
        MSG: 'Bad number format'
    
      },
    
      BAD_IDENTIFER    : {
    
        CODE: 1003,
    
        MSG: 'Bad identifer, identifer allowed cahrs [_a-zA-Z]'
    
      },
    
      UNABLE_TO_PUTBACK_NON_TOKEN: {
    
        CODE: 1004,
    
        MSG: 'Unable to putback non token object'
    
      }
    
    };
    
    
    
    /**
    
     * [LexError]
    
     * @param {number} code
    
     * @param {string} msg
    
     * @param {number} pos
    
     * @param {string} token
    
     */
    
    var LexError = function(code, msg, pos, token)
    
    {
    
      var _code  = code !== undefined ? code : null;
    
      var _msg   = msg !== undefined ? msg : null;
    
      var _pos   = pos !== undefined ? pos : null;
    
      var _token = token !== undefined ? token : null;
    
    
    
      /**
    
       * [getToken]
    
       * @return {string} [description]
    
       */
    
      this.getToken = function() {
    
        return _token;
    
      };
    
    
    
      /**
    
       * [getPos]
    
       * @return {number} [description]
    
       */
    
      this.getPos = function() {
    
        return _pos;
    
      };
    
    
    
      /**
    
       * [getCode]
    
       * @return {number} [description]
    
       */
    
      this.getCode = function() {
    
        return _code;
    
      };
    
    
    
      /**
    
       * [getMessage]
    
       * @return {string}
    
       */
    
      this.getMessage = function() {
    
        return _msg;
    
      };
    
    };
    
    
    
    LexError.create = function(code, msg, pos, token) {
    
      return new LexError(code, msg, pos, token);
    
    };
    
    
    
    LexError.UnableToParseString = function(pos) {
    
      return LexError.create(LEX_ERROR.PARSE_STRING.CODE, LEX_ERROR.PARSE_STRING.MSG, pos);
    
    };
    
    
    
    LexError.UnknownOperator = function(pos, token) {
    
      return LexError.create(LEX_ERROR.UNKNOWN_OPERATOR.CODE, LEX_ERROR.UNKNOWN_OPERATOR.MSG, pos, token);
    
    };
    
    
    
    LexError.BadNumber = function(pos, token) {
    
      return LexError.create(LEX_ERROR.BAD_NUMBER.CODE, LEX_ERROR.BAD_NUMBER.MSG, pos, token);
    
    };
    
    
    
    LexError.BadIdentifer = function(pos, token) {
    
      return LexError.create(LEX_ERROR.BAD_IDENTIFER.CODE, LEX_ERROR.BAD_IDENTIFER.MSG, pos, token);
    
    };
    
    
    
    LexError.UnableToPutbackToken = function(pos, token) {
    
      return LexError.create(LEX_ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.CODE, LEX_ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.MSG, pos, token);
    
    };
    
    
    var TOKEN_TYPE = {
      ERROR:      0,
      IDENTIFER:  1,
      CONST:      2,
      OPERATOR:   3,
      KEYWORDS:   4
    };
    
    /**
     * [Token]
     * @param {number} type  [description]
     * @param {string} token [description]
     * @param {number} pos   [description]
     */
    var Token = function(type, token, pos)
    {
      this.type  = type;
      this.token = token;
      this.pos   = pos;
    };
    
    /**
     * [getType]
     * @return {number} [description]
     */
    Token.prototype.getType = function() {
      return this.type;
    };
    
    /**
     * [toString]
     * @return {string} [description]
     */
    Token.prototype.toString = function() {
      return this.token;
    };
    
    /**
     * [getPos]
     * @return {number} [description]
     */
    Token.prototype.getPos = function() {
      return this.pos;
    };
    
    /**
     * [isError]
     * @return {Boolean} [description]
     */
    Token.prototype.isError = function() {
      return this.type === TOKEN_TYPE.ERROR;
    };
    
    /**
     * [isIdentifer]
     * @return {Boolean} [description]
     */
    Token.prototype.isIdentifer = function() {
      return this.type === TOKEN_TYPE.IDENTIFER;
    };
    
    /**
     * [isConst]
     * @return {Boolean} [description]
     */
    Token.prototype.isConst = function() {
      return this.type === TOKEN_TYPE.CONST;
    };
    
    /**
     * [isOperator]
     * @return {Boolean} [description]
     */
    Token.prototype.isOperator = function() {
      return this.type === TOKEN_TYPE.OPERATOR;
    };
    
    /**
     * [isKeyword]
     * @return {Boolean} [description]
     */
    Token.prototype.isKeyword = function() {
      return this.type === TOKEN_TYPE.KEYWORD;
    };
    
    /**
     * [clone]
     * @return {Token} [description]
     */
    Token.prototype.clone = function() {
      return new Token(this.type, this.token, this.pos);
    };
    
    Token.create = function(token_type, values) {
      // console.log('Token.create(' + token_type + ',' + JSON.stringify(values) +')');
      
      if(typeof token_type == 'string') {
        token_type = token_type.toLowerCase();
        switch(token_type) {
          case "identifer":
            return new TokenIdentifer(values.token, values.pos);
          case "const":
            return new TokenConst(values.token, values.pos, values.data_type);
          case "keyword":
            return new TokenKeyword(values.token, values.pos, values.code);
          case "operator":
            return new TokenOperator(values.token, values.pos, values.op, values.precedence);
        }
      }
      switch(token_type) {
        case TOKEN_TYPE.IDENTIFER:
          return new TokenIdentifer(values.token, values.pos);
        case TOKEN_TYPE.CONST:
          return new TokenConst(values.token, values.pos, values.data_type);
        case TOKEN_TYPE.KEYWORD:
          return new TokenKeyword(values.token, values.pos, values.code);
        case TOKEN_TYPE.OPERATOR:
          return new TokenOperator(values.token, values.pos, values.op, values.precedence);
      }
      return null;
    };
    
    /**
     * [TokenConst]
     * @param {string} token [description]
     * @param {number} pos   [description]
     * @param {number} dtype Value of CONST global object
     */
    var TokenConst = function(token, pos, dtype)
    {
      Token.call(this, TOKEN_TYPE.CONST, token, pos);
      this.dtype = dtype;
    };
    _extends(TokenConst, Token);
    
    /**
     * [getDataType]
     * @return {number} [description]
     */
    TokenConst.prototype.getDataType = function() {
      return this.dtype;
    };
    
    /**
     * [clone]
     * @return {TokenConst} [description]
     */
    TokenConst.prototype.clone = function() {
      return new TokenConst(this.toString(), this.getPos(), this.getDataType());
    };
    
    /**
     * [TokenIdentifer]
     * @param {string} token [description]
     * @param {number} pos   [description]
     */
    var TokenIdentifer = function(token, pos)
    {
      Token.call(this, TOKEN_TYPE.IDENTIFER, token, pos);
    };
    _extends(TokenIdentifer, Token);
    
    /**
     * [clone]
     * @return {[TokenIdentifer} [description]
     */
    TokenIdentifer.prototype.clone = function() {
      return new TokenIdentifer(this.toString(), this.getPos());
    };
    
    /**
     * [TokenKeyword]
     * @param {string} token [description]
     * @param {number} pos   [description]
     * @param {number} code  [description]
     */
    var TokenKeyword = function(token, pos, code)
    {
      Token.call(this, TOKEN_TYPE.KEYWORD, token, pos);
      this.code  = code;
    };
    _extends(TokenKeyword, Token);
    
    /**
     * [getCode]
     * @return {number} [description]
     */
    TokenKeyword.prototype.getCode = function() {
      return this.code;
    };
    
    /**
     * [clone]
     * @return {TokenKeyword} [description]
     */
    TokenKeyword.prototype.clone = function() {
      return new TokenKeyword(this.toString(), this.getPos(), this.getCode());
    };
    
    /**
     * [TokenOperator]
     * @param {string} token      [description]
     * @param {number} pos        [description]
     * @param {number} op         [description]
     * @param {number} precedence [description]
     */
    var TokenOperator = function(token, pos, op, precedence)
    {
      Token.call(this, TOKEN_TYPE.OPERATOR, token, pos);
      this.op = op;
      this.precedence = precedence;
    };
    _extends(TokenOperator, Token);
    
    /**
     * [getOperator]
     * @return {number} [description]
     */
    TokenOperator.prototype.getOperator = function() {
      return this.op;
    };
    
    /**
     * [getPrecedence]
     * @return {number} [description]
     */
    TokenOperator.prototype.getPrecedence = function() {
      return this.precedence;
    };
    
    /**
     * [is]
     * @param  {number}  op_code [description]
     * @return {Boolean}         [description]
     */
    TokenOperator.prototype.is = function(op_code) {
      return this.op === op_code;
    };
    
    TokenOperator.prototype.isUnary = function() {
      switch(this.op) {
        case OPERATOR.NOT: return true;
      }
      return false;
    };
    
    /**
     * [clone]
     * @return {TokenOperator} [description]
     */
    TokenOperator.prototype.clone = function() {
      return new TokenOperator(this.toString(), this.getPos(), this.getOperator(), this.getPrecedence());
    };
    
    
    var Lex = function(input)
    {
      if(typeof input === 'string') {
        var expr = input;
        input = {
          buf:     expr,
          buf_len: expr.length,
          pos:     0
        };
      }
    
      var _input      = input;
      var _prev_token = null;
      var _back_token = null;
      var _last_error = null;
    
      var _isStopChar = function(ch) {
        return _stopchars.indexOf(ch) !== -1;
      };
    
      var _getString = function(quote_operator, start_from, input) {
        var str = '';
        var j = start_from + 1; // skip quote
        var complete = false;
    
        for(j; j < input.buf_len; j++) {
          if( (quote_operator === OPERATOR.QUOTE_DOUBLE && input.buf[j] === '"') ||
              (quote_operator === OPERATOR.QUOTE_SINGLE && input.buf[j] === '\'') ) {
            complete = true;
            break;
          }
          str += input.buf[j];
        }
    
        if(!complete) {
          return null;
        }
    
        input.pos = j + 1;
        return str;
      };
    
      var _nextChar = function(input) {
        if(input.pos + 1 < input.buf_len) {
          return input.buf[input.pos + 1];
        }
        return null;
      };
    
      var _isOperator = function(token, input) {
        var op_code = null;
    
        switch(token) {
          case "'":
            op_code = OPERATOR.QUOTE_SINGLE;
            break;
          case '"':
            op_code = OPERATOR.QUOTE_DOUBLE;
            break;
          case ",":
            op_code = OPERATOR.COMMA;
            break;
          case '?':
            op_code = OPERATOR.IN;
            break;
          case '!':
            if(_nextChar(input) === '=') {
              input.pos++;
              token += '=';
              op_code = OPERATOR.NEQ;
            }else {
              op_code = OPERATOR.NOT;
            }
            break;
          case '(':
            op_code = OPERATOR.OPEN_PAR;
            break;
          case ')':
            op_code = OPERATOR.CLOSE_PAR;
            break;
          case '+':
            if(_nextChar(input) === '+') {
              input.pos++;
              token += '+';
              op_code = OPERATOR.INC;
            }else {
              op_code = OPERATOR.SUM;
            }
            break;
          case '-':
            if(_nextChar(input) === '-') {
              input.pos++;
              token += '-';
              op_code = OPERATOR.DEC;
            }else {
              op_code = OPERATOR.DIF;
            }
            break;
          case '*':
            op_code = OPERATOR.MUL;
            break;
          case '/':
            op_code = OPERATOR.DIV;
            break;
          case '%':
            op_code = OPERATOR.MOD;
            break;
          case "and":
            op_code = OPERATOR.AND;
            break;
          case "or":
            op_code = OPERATOR.OR;
            break;
          case ">":
            if(_nextChar(input) === '=') {
              input.pos++;
              token += '=';
              op_code = OPERATOR.GET;
            }else {
              op_code = OPERATOR.GT;
            }
            break;
          case "<":
            if(_nextChar(input) === '=') {
              input.pos++;
              token += '=';
              op_code = OPERATOR.LET;
            }else {
              op_code = OPERATOR.LT;
            }
            break;
          case "=":
            if(_nextChar(input) === '=') {
              input.pos++;
              token += '=';
              op_code = OPERATOR.EQ;
            }
            break;
          case ".":
            op_code = OPERATOR.DOT;
            break;
          case " ":
            op_code = OPERATOR.WS;
            break;
        }
    
        return {
          code:  op_code,
          token: token,
          precedence: _precedence[token] !== undefined ? _precedence[token] : null
        };
      };
    
      var _isKeyword = function(token) {
        if(_keywords[token] !== undefined) {
          return _keywords[token];
        }
        return null;
      };
    
      var _isDigit = function(ch) {
        return (
                  ch === '0' ||
                  ch === '1' ||
                  ch === '2' ||
                  ch === '3' ||
                  ch === '4' ||
                  ch === '5' ||
                  ch === '6' ||
                  ch === '7' ||
                  ch === '8' ||
                  ch === '9'
              );
      };
    
      /**
       * [_getStringToken]
       * @param  {TokenOperator} quote_op
       * @param  {[type]} input    [description]
       * @return {[type]}          [description]
       */
      var _getStringToken = function(quote_op, input) {
        //console.log('Lex._getStringToken(' + quote_op + ',' + JSON.stringify(input) + ')');
        var begin_pos = input.pos;
        var str = _getString(quote_op, begin_pos, input);
    
        //console.log('Lex._getStringToken(): got str=<' + str + '>');
    
        if(str === null) {
          _last_error = LexError.UnableToParseString(begin_pos);
          return null;
        }
    
        return Token.create("const", {
          token: str,
          pos: begin_pos,
          data_type: DATA_TYPE.STRING
        });
      };
    
      var _readNextToken = function(input) {
        //console.log('Lex._readNextToken(): input.buf=' + input.buf + ', input.pos=' + input.pos);
        var token = '';
    
        for(var i = input.pos; i < input.buf_len; i++) {
          var ch = input.buf[i];
          if(!_isStopChar(ch)) {
            token += ch;
            continue;
          }
    
          if(token.length === 0) {
            if(ch === '.' && _isDigit(_nextChar(input))) {
              token += '0' + ch;
              continue;
            }
    
            if(_prev_token === null && (ch === '-' || ch === '+') && _isDigit(_nextChar(input))) {
              // +number, -number
              token += ch;
              continue;
            }
    
            var op = _isOperator(ch, input);
            if(op.code === null) {
              //console.log('Lex._readNextToken(): caught unknown operator <' + ch + '>');
              _last_error = LexError.UnknownOperator(input.pos, ch);
              return null;
            }
    
            if(op.code == OPERATOR.QUOTE_SINGLE || op.code == OPERATOR.QUOTE_DOUBLE) {
              //console.log('Lex._readNextToken(): trying to get string...');
              return _getStringToken(op.code, input);
            }
    
            input.pos++;
            return Token.create("operator", {
              token: op.token,
              pos: input.pos,
              op: op.code,
              precedence: op.precedence
            });
          }else {
            if((ch === '.' || _isDigit(ch)) && token.match(/([0-9])/)) {
              token += ch;
              continue;
            }
            break;
          }
        }
    
        input.pos += token.length;
        if(token.length === 0) {
          return null;
        }
    
        var kw_code = _isKeyword(token);
        if(kw_code !== null) {
          return Token.create("keyword", {
            token: token,
            pos: input.pos - token.length,
            code: kw_code
          });
        }
    
        var op = _isOperator(token);
        if(op.code !== null) {
          return Token.create("operator", {
            token: token,
            pos: input.pos - token.length,
            op: op.code,
            precedence: op.precedence
          });
        }
    
        if(token.match(/(^|[ \t])([-+]?(\d+|\.\d+|\d+\.\d*))($|[^+-.])/)) {
          if(isNaN(+token)) {
            _last_error = LexError.BadNumber(input.pos - token.length, token);
            return null;
          }
          return Token.create("const", {
            token: token,
            pos: input.pos - token.length,
            data_type: DATA_TYPE.NUMBER
          });
        }
    
        if(!token.match(/^_?([_a-zA-Z])+$/)) {
          _last_error = LexError.BadIdentifer(input.pos - token.length, token);
          return null;
        }
    
        //console.log('Lex._readNextToken(): trying to create Token.create("identifer", ' + token + ')');
    
        var ret = Token.create("identifer", {
          token: token,
          pos: input.pos - token.length
        });
    
        //console.log('Lex._readNextToken(): ret=' + ret);
    
        return ret;
      };
    
      /**
       * [Return next token from input sequence]
       * @return {Token} Token object
       */
      this.getToken = function() {
        if(_back_token !== null) {
          var t = _back_token.clone();
          _back_token = null;
          return t;
        }
        _prev_token = _readNextToken(_input);
        return _prev_token;
      };
    
      /**
       * [Putback token object]
       * @param  {Token} token Token object
       */
      this.putback = function(token) {
        if(token instanceof Token === false) {
          _last_error = LexError.UnableToPutbackToken(_input.pos, token);
          return false;
        }
        _back_token = token.clone();
        return true;
      };
    
      /**
       * [Return last error object]
       * @return {LexError} LexError object
       */
      this.getLastError = function() {
        return _last_error;
      };
    
    };
    
    var PARSER_ERROR = {
      UNEXPECTED_TOKEN: {
        MSG: 'Unexpected token',
        CODE: 2000
      },
      UNEXPECTED_TOKEN_SEQ: {
        MSG: 'Unexpected end of tokens sequence',
        CODE: 2001
      },
      UNABLE_PARSE_EXPR: {
        MSG: 'Unable to parse expression',
        CODE: 2002
      }
    };
    
    /**
     * [ParserError]
     * @param {number} code
     * @param {string} msg
     * @param {object} token
     */
    var ParserError = function(code, msg, token)
    {
      var _code  = code;
      var _msg   = msg;
      var _token = token;
    
      /**
       * [getToken]
       * @return {object} [description]
       */
      this.getToken = function() {
        return _token;
      };
    
      /**
       * [getCode]
       * @return {number} [description]
       */
      this.getCode = function() {
        return _code;
      };
    
      /**
       * [getMessage]
       * @return {string}
       */
      this.getMessage = function() {
        return _msg;
      };
    
    };
    
    ParserError.create = function(code, msg, token) {
      return new ParserError(code, msg, token);
    };
    
    ParserError.UnexpectedToken = function(token) {
      return ParserError.create(PARSER_ERROR.UNEXPECTED_TOKEN.CODE, PARSER_ERROR.UNEXPECTED_TOKEN.MSG, token);
    };
    
    ParserError.UnexpectedTokenSeq = function() {
      return ParserError.create(PARSER_ERROR.UNEXPECTED_TOKEN_SEQ.CODE, PARSER_ERROR.UNEXPECTED_TOKEN_SEQ.MSG, null);
    };
    
    ParserError.UnableParseExpr = function() {
      return ParserError.create(PARSER_ERROR.UNABLE_PARSE_EXPR.CODE, PARSER_ERROR.UNABLE_PARSE_EXPR.MSG, null);
    };
    
    var AST_NODE_TYPE = {
      EXPR:           0,
      UNARY_EXPR:     1,
      FUNCTION_CALL:  2,
      CONST:          3,
      VARIABLE:       4,
      MEMBER_OF_OBJ:  5
    };
    
    /**
     * @param {[type]} type [description]
     */
    var ASTNode = function(type)
    {
      this.type = type;
    };
    
    ASTNode.prototype.getType = function() {
      return this.type;
    };
    ASTNode.prototype.isExpr = function() {
      return this.type === AST_NODE_TYPE.EXPR;
    };
    ASTNode.prototype.isFunctionCall = function() {
      return this.type === AST_NODE_TYPE.FUNCTION_CALL;
    };
    ASTNode.prototype.isConst = function() {
      return this.type === AST_NODE_TYPE.CONST;
    };
    ASTNode.prototype.isVariable = function() {
      return this.type === AST_NODE_TYPE.VARIABLE;
    };
    ASTNode.prototype.isMemberOfObj = function() {
      return this.type === AST_NODE_TYPE.MEMBER_OF_OBJ;
    };
    ASTNode.prototype.execute = function(scope) {
      return null;
    };
    
    /**
     * @param {[type]} val  [description]
     * @param {[type]} type [description]
     */
    var ASTNodeConst = function(val, type)
    {
      ASTNode.call(this, AST_NODE_TYPE.CONST);
      this.val = val;
      this.dtype = type;
    
      if(type === DATA_TYPE.NUMBER) {
        this.val = +this.val;
      }
    };
    _extends(ASTNodeConst, ASTNode);
    
    ASTNodeConst.prototype.getDataType = function() {
      return this.dtype;
    };
    
    ASTNodeConst.prototype.execute = function(scope) {
      /*if(this.type === DATA_TYPE.NUMBER) {
        return +this.val;
      }*/
      return this.val;
    };
    
    /**
     * @param {[type]} name [description]
     * @param {[type]} args [description]
     */
    var ASTNodeFunc = function(name, args)
    {
      ASTNode.call(this, AST_NODE_TYPE.FUNCTION_CALL);
      this.name = name;
      this.args = args;
    };
    _extends(ASTNodeFunc, ASTNode);
    
    ASTNodeFunc.prototype.execute = function(scope) {
      //console.log('Execute function <' + this.name + '>' + JSON.stringify(this.args));
      if(scope[this.name] === undefined || typeof scope[this.name] !== 'function') {
        //console.log('Unknown function <' + this.name + '>');
        return null;
      }
      var vargs = [];
      var len = this.args.length;
      for(var i = 0 ; i < len; i++) {
        vargs[i] = this.args[i].execute(scope);
      }
      return scope[this.name].apply(scope, vargs);
    };
    
    /**
     * @param {[type]} name [description]
     */
    var ASTNodeVariable = function(name)
    {
      ASTNode.call(this, AST_NODE_TYPE.VARIABLE);
      this.name = name;
    };
    _extends(ASTNodeVariable, ASTNode);
    
    ASTNodeVariable.prototype.getName = function() {
      return this.name;
    };
    
    ASTNodeVariable.prototype.execute = function(scope) {
      var val = scope[this.name] !== undefined ? scope[this.name] : null;
      return val;
    };
    
    /**
     * @param {[type]} operator      [description]
     * @param {[type]} left_operand  [description]
     * @param {[type]} right_operand [description]
     */
    var ASTNodeExpr = function(operator, left_operand, right_operand)
    {
      ASTNode.call(this, AST_NODE_TYPE.EXPR);
      this.op = operator;
      this.left = left_operand;
      this.right = right_operand;
    };
    _extends(ASTNodeExpr, ASTNode);
    
    ASTNodeExpr.prototype.toString = function() {
      return this.op + '(' + this.left.toString() + ',' + this.right.toString() + ')';
    };
    
    ASTNodeExpr.prototype.in = function(needle, haystack) {
      var to = typeof haystack;
      if(Array.isArray(haystack) || to === 'string') {
        return haystack.indexOf(needle) !== -1;
      }
      if(to === 'object') {
        return haystack[needle] !== undefined;
      }
      return null;
    };
    
    ASTNodeExpr.prototype.execute = function(scope) {
      switch(this.op) {
        case OPERATOR.SUM: return this.left.execute(scope) + this.right.execute(scope);
        case OPERATOR.DIF: return this.left.execute(scope) - this.right.execute(scope);
        case OPERATOR.MUL: return this.left.execute(scope) * this.right.execute(scope);
        case OPERATOR.DIV: return this.left.execute(scope) / this.right.execute(scope);
        case OPERATOR.MOD: return this.left.execute(scope) % this.right.execute(scope);
        case OPERATOR.GT: return this.left.execute(scope) > this.right.execute(scope);
        case OPERATOR.LT: return this.left.execute(scope) < this.right.execute(scope);
        case OPERATOR.EQ: return this.left.execute(scope) == this.right.execute(scope);
        case OPERATOR.GET: return this.left.execute(scope) >= this.right.execute(scope);
        case OPERATOR.LET: return this.left.execute(scope) <= this.right.execute(scope);
        case OPERATOR.AND: return this.left.execute(scope) && this.right.execute(scope);
        case OPERATOR.OR: return this.left.execute(scope) || this.right.execute(scope);
        case OPERATOR.NEQ: return this.left.execute(scope) != this.right.execute(scope);
        case OPERATOR.DOT: return this.right.execute(this.left.execute(scope));
        case OPERATOR.IN: return this.in(this.left.execute(scope), this.right.execute(scope));
      }
      return null;
    };
    
    /**
     * @param {[type]} operator
     * @param {[type]} operand
     */
    var ASTNodeUnaryExpr = function(operator, operand) {
      ASTNode.call(this, AST_NODE_TYPE.UNARY_EXPR);
      this.op = operator;
      this.operand = operand;
    };
    _extends(ASTNodeUnaryExpr, ASTNode);
    
    ASTNodeUnaryExpr.prototype.toString = function() {
      return this.op + '(' + this.operand.toString() + ')';
    };
    
    ASTNodeUnaryExpr.prototype.execute = function(scope) {
      switch(this.op) {
        case OPERATOR.NOT: return !this.operand.execute(scope);
      }
      return null;
    };
    
    /**
     * @param {[type]} name [description]
     */
    var ASTNodeMemberOfObj = function(obj_name, next)
    {
      ASTNode.call(this, AST_NODE_TYPE.MEMBER_OF_OBJ);
      this.obj_name = obj_name;
      this.next = next || null;
    };
    _extends(ASTNodeMemberOfObj, ASTNode);
    
    ASTNodeMemberOfObj.prototype.getNextValue = function(next, scope) {
      if(next.isMemberOfObj() || next.isVariable() || next.isFunctionCall()) {
        return next.execute(scope);
      }
      // Error
      return null;
    };
    
    ASTNodeMemberOfObj.prototype.getObjName = function() {
      return this.obj_name;
    };
    
    ASTNodeMemberOfObj.prototype.execute = function(scope) {
      if(scope[this.obj_name] === undefined) {
        return undefined;
      }
      if(this.next !== null) {
        return this.getNextValue(this.next, scope[this.obj_name]);
      }
      return scope[this.obj_name];
    };
    
    
    /**
     * Converts token sequence to the AST nodes
     */
    var Parser = function()
    {
      var _ast = null;
      var _last_error = null;
    
      /**
       * [_token2astnode]
       * @param  {object} token
       * @return {object} ASTNodeVariable / ASTNodeConst
       */
      function _token2astnode(token) {
        switch(token.getType()) {
          case TOKEN_TYPE.IDENTIFER: return new ASTNodeVariable(token.toString());
          case TOKEN_TYPE.CONST: return new ASTNodeConst(token.toString(), token.getDataType());
          default:
            _last_error = ParserError.UnexpectedToken(token);
          break;
        }
        return null;
      };
    
      /**
       * [_createBinExprNode]
       * @param  {Array} operators Array of operator tokens
       * @param  {Array} operands  Array of AST nodes
       * @return {object}          ASTNodeExpr
       */
      function _createBinExprNode(operators, operands) {
        var operator = operators.pop();
    
        var right_operand = operands.pop();
        if(right_operand instanceof Token) {
          right_operand = _token2astnode(right_operand);
        }
    
        var left_operand = operands.pop();
        if(left_operand instanceof Token) {
          left_operand = _token2astnode(left_operand);
        }
    
        //console.log(operator.toString() + ' NODE(' + left_operand.toString() + ',' + right_operand.toString() + ')');
        return new ASTNodeExpr(operator.getOperator(), left_operand, right_operand);
      };
    
      /**
       * [_buildAST]
       * @param  {Array} chain Array of tokens or AST nodes
       * @return {[type]}       [description]
       */
      function _buildAST(chain) {
        var operands   = [];
        var operators  = [];
        var len = chain.length;
    
        for(var i = 0 ; i < len ; i++) {
          var n = chain[i];
          if(n instanceof ASTNode) {
            operands.push(n);
          }else {
            if(operators.length === 0) {
              operators.push(n);
            }else {
              var operator = operators[operators.length - 1];
              if(n.is(OPERATOR.OPEN_PAR) || n.getPrecedence() > operator.getPrecedence()) {
                operators.push(n);
              }else if(n.is(OPERATOR.CLOSE_PAR)) {
                for(;;) {
                  var operator = operators.pop();
                  if(operator.is(OPERATOR.OPEN_PAR)) {
                    break;
                  }
                  var right_operand = operands.pop();
                  var left_operand = operands.pop();
                  operands.push(new ASTNodeExpr(operator.getOperator(), left_operand, right_operand));
                }
             }else {
               operands.push(_createBinExprNode(operators, operands));
               operators.push(n);
             }
            }
          }
        }
    
        while(operators.length != 0) {
          operands.push(_createBinExprNode(operators, operands));
        }
    
        if(operands.length === 1) {
          return operands[0];
        }
    
        return null;
      };
    
      function _processFunction(token, lex) {
        var fname = token.toString();
        var pos = token.getPos();
        var args = []; // AST nodes. Before build ASTNodeFunc - build AST noes for arguments.
        var buf = []; // Tokens buffer
        var par_cnt = 0;
        lex.getToken(); // Skip '('
    
        //console.log('BEGIN function <' + fname + '> pos:' + pos);
    
        for(;;) {
          var t = lex.getToken();
    
          if(t === null) {
            break;
          }
    
          if(t.isOperator()) {
            if(t.is(OPERATOR.COMMA)) {
              if(buf.length === 0) {
                // Error
                return null;
              }
              args.push(_buildAST(buf.slice()));
              buf = [];
              continue;
            }else if(t.is(OPERATOR.CLOSE_PAR)) {
              if(par_cnt === 0) {
                if(args.length > 0 && buf.length === 0) {
                  // Error
                  return null;
                }
                if(buf.length > 0) {
                  args.push(_buildAST(buf.slice()));
                }
                buf = [];
                break; // End of function call
              }else {
                buf.push(token);
                par_cnt--;
              }
            }else if(t.is(OPERATOR.OPEN_PAR)) {
              buf.push(token);
              par_cnt++;
            }else if(t.is(OPERATOR.WS)) {
              continue;
            }
            buf.push(t);
            continue;
          }
    
          buf.push(_processToken(t, lex));
        }
    
        if(args.length > 0) {
          //console.log('<' + fname + '> args: ' + JSON.stringify(args));
        }else {
          //console.log('<' + fname + '> no args');
        }
        //console.log('END function <' + fname + '> pos:' + pos);
    
        return new ASTNodeFunc(fname, args);
      };
    
      function _processMemberOf(token, lex) {
        var ident = token.toString();
        var pos = token.getPos();
        lex.getToken(); // Skip '.'
    
        var nt = lex.getToken();
        if(nt === null || !nt.isIdentifer()) {
          return null;
        }
    
        var next = _processIdentifer(nt, lex);
        return new ASTNodeMemberOfObj(ident, next);
      };
    
      function _processIdentifer(token, lex) {
        var ident   = token.toString();
        var pos     = token.getPos();
        var nexttok = lex.getToken();
        if(nexttok === null) {
          return new ASTNodeVariable(ident);
        }
        lex.putback(nexttok);
        if(nexttok.isOperator() && nexttok.is(OPERATOR.OPEN_PAR)) {
          return _processFunction(token, lex);
        }
        if(nexttok.isOperator() && nexttok.is(OPERATOR.DOT)) {
          return _processMemberOf(token, lex);
        }
        return new ASTNodeVariable(ident);
      };
    
      function _processConst(token) {
        return _token2astnode(token);
      };
    
      function _processOperator(token, operators, operands, lex) {
        if(operators.length === 0) {
          var is_save_token = true;
          if(token.isUnary()) {
            var nexttok = lex.getToken();
            if(nexttok === null) {
              _last_error = ParserError.UnexpectedTokenSeq();
              return null;
            }
            if(nexttok instanceof TokenConst) {
              operands.push(new ASTNodeUnaryExpr(token.getOperator(), _processConst(nexttok)));
              is_save_token = false;
            }else if(nexttok instanceof TokenIdentifer) {
              operands.push(new ASTNodeUnaryExpr(token.getOperator(), _processIdentifer(nexttok, lex)));
              is_save_token = false;
            }else {
              lex.putback(nexttok);
            }
          }
          if(is_save_token) {
            operators.push(token);
          }
        }else {
          var operator = operators[operators.length - 1];
          if(token.is(OPERATOR.OPEN_PAR) || token.getPrecedence() > operator.getPrecedence()) {
            operators.push(token);
          }else if(token.is(OPERATOR.CLOSE_PAR)) {
            for(;;) {
              var operator = operators.pop();
              if(operator.is(OPERATOR.OPEN_PAR)) {
                break;
              }
              var right_operand = operands.pop();
              var left_operand = operands.pop();
              operands.push(new ASTNodeExpr(operator.getOperator(), left_operand, right_operand));
            }
          }else {
            operands.push(_createBinExprNode(operators, operands));
            operators.push(token);
          }
        }
      };
    
      function _processToken(token, lex) {
        switch(token.getType()) {
          case TOKEN_TYPE.IDENTIFER:
            return _processIdentifer(token, lex);
          case TOKEN_TYPE.CONST:
            return _processConst(token);
          default:
            _last_error = ParserError.UnexpectedToken(token);
            break;
        }
        return null;
      };
    
      function _process(token, lex, operators, operands) {
        switch(token.getType()) {
          case TOKEN_TYPE.IDENTIFER:
               operands.push(_processToken(token, lex));
            break;
          case TOKEN_TYPE.CONST:
              operands.push(_processConst(token, lex));
            break;
          case TOKEN_TYPE.OPERATOR:
              _processOperator(token, operators, operands, lex);
            break;
          default:
              _last_error = ParserError.UnexpectedToken(token);
          break;
        }
      };
    
      function _parseExpr(lex) {
        var operands   = [];
        var operators  = [];
    
        for(;;) {
          var token = lex.getToken();
          if(token === null) {
            break;
          }
          if(token.isOperator() && token.is(OPERATOR.WS)) {
            continue;
          }
          _process(token, lex, operators, operands);
          if(_last_error !== null) {
            return null;
          }
        }
    
        if(lex.getLastError() !== null) {
          _last_error = lex.getLastError();
          return null;
        }
    
        while(operators.length != 0) {
          operands.push(_createBinExprNode(operators, operands));
        }
    
        if(operands.length === 1) {
          return operands[0];
        }
    
        _last_error = ParserError.UnableParseExpr();
    
        return null;
      };
    
      this.parse = function(lex) {
        _ast = _parseExpr(lex);
        return _ast !== null;
      };
    
      this.getLastError = function() {
        return _last_error;
      };
    
      this.getAST = function() {
        return _ast;
      };
    };
    

    var _last_error = null;

    /**
      * ----------------------------------------------------------------------------------------------------------------
      * Private methods
      * ----------------------------------------------------------------------------------------------------------------
      */
      var _parse = function(input) {
        var lex    = new Lex(input);
        var parser = new Parser();

        if(!parser.parse(lex)) {
          var lerr = lex.getLastError();
          if(lerr !== null) {
            /*console.log('Lex-Error<' + lerr.getCode() + '>: ' + lerr.getDef() +
                        ' in token<' + lerr.getToken() + '>' + ' at ' + (lerr.getPos() + 1) + ' pos');*/
            _last_error = lerr;
            return null;
          }

          var perr = parser.getLastError();
          if(perr !== null) {
            _last_error = perr;
            return null;
          }
        }

        return parser.getAST();
      };

    /**
     * -----------------------------------------------------------------------------------------------------------------
     * Module public methods
     * -----------------------------------------------------------------------------------------------------------------
     */

     var parse = function(expr) {
       var input = {
         buf:     expr,
         buf_len: expr.length,
         pos:     0
       };
       return _parse(input);
     };

     var getLastError = function() {
       return _last_error;
     };

    /*******************************************************************************************************************
     * Module public interface
     */
    return {
      parse: parse,
      getLastError: getLastError
    };

  })();

  if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = expr4js;
  }else {
    window['expr4js'] = expr4js;
  }

})();
