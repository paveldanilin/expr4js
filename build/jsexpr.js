/***********************************************************************************************************************
* Javascript-Expression parser
* Version: 0.1
***********************************************************************************************************************/

(function () {

  var jsexpr = (function () {

    var _extends = function(child, parent) {

      child.prototype = Object.create(parent.prototype);

    };

    
    var TTOKEN = {
      ERROR:      0,
      IDENTIFER:  1,
      CONST:      2,
      OPERATOR:   3,
      KEYWORDS:   4
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
      COMMA:      117
    };
    
    var ERROR = {
      PARSE_STRING     : {
        CODE: 1000,
        DEF: 'Unable to parse string'
      },
      UNKNOWN_OPERATOR : {
        CODE: 1001,
        DEF: 'Unknown operator'
      },
      BAD_NUMBER       : {
        CODE: 1002,
        DEF: 'Bad number format'
      },
      BAD_IDENTIFER    : {
        CODE: 1003,
        DEF: 'Bad identifer, identifer allowed cahrs [_a-zA-Z]'
      }
    };
    
    var CONST = {
      STRING: 10000,
      NUMBER: 10001
    };
    
    var QUOTE = {
      SINGLE: 1,
      DOUBLE: 2
    };
    
    var _keywords = {};
    var _stopchars = ['?', '!', '=', '>', '<', '"', '\'', '.', ' ', '(', ')', ',', '*', '+', '-'];
    var _precedence = {
      '(': 1,
      ')': 2,
      '||': 3, 'or': 3,
      '&&': 4, 'and': 4,
      '<': 5, '>': 5, '<=': 5, '>=': 5, '==': 5, '!=': 5, '?': 5,
      '+':  6, '-': 6,
      '*':  7, '/': 7,
      '.': 8
    };
    
    /*=require ../common.js*/
    var LexError = function(token, pos, code, def) {
      var _token = token;
      var _pos   = pos;
      var _code  = code;
      var _def   = def;
    
      this.getToken = function() {
        return _token;
      };
      
      this.getPos = function() {
        return _pos;
      };
    
      this.getCode = function() {
        return _code;
      };
    
      this.getDef = function() {
        return _def;
      };
    
    };
    
    /**
     * Base token
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     */
    var Token = function(type, token, pos) {
      this.type  = type;
      this.token = token;
      this.pos   = pos;
    };
    Token.prototype = {
      getType: function() {
        return this.type;
      },
    
      toString: function() {
        return this.token;
      },
    
      getPos: function() {
        return this.pos;
      },
    
      isError: function() {
        return this.type === TTOKEN.ERROR;
      },
    
      isIdentifer: function() {
        return this.type === TTOKEN.IDENTIFER;
      },
    
      isConst: function() {
        return this.type === TTOKEN.CONST;
      },
    
      isOperator: function() {
        return this.type === TTOKEN.OPERATOR;
      },
    
      isKeyword: function() {
        return this.type === TTOKEN.KEYWORD;
      },
    
      clone: function() {
        return new Token(this.type, this.token, this.pos);
      }
    };
    
    /**
     * Token const
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     * @param {[type]} op  [description]
     */
    var TokenConst = function(token, pos, dtype) {
      Token.call(this, TTOKEN.CONST, token, pos);
      this.dtype = dtype;
    };
    _extends(TokenConst, Token);
    
    TokenConst.prototype.getDataType = function() {
      return this.dtype;
    };
    
    TokenConst.prototype.clone = function() {
      return new TokenConst(this.toString(), this.getPos(), this.getDataType());
    };
    
    /**
     * Token identifer
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     * @param {[type]} op  [description]
     */
    var TokenIdentifer = function(token, pos) {
      Token.call(this, TTOKEN.IDENTIFER, token, pos);
    };
    _extends(TokenIdentifer, Token);
    
    TokenIdentifer.prototype.clone = function() {
      return new TokenIdentifer(this.toString(), this.getPos());
    };
    
    /**
     * Token keyword
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     * @param {[type]} op  [description]
     */
    var TokenKeyword = function(token, pos, code) {
      Token.call(this, TTOKEN.KEYWORD, token, pos);
      this.code  = code;
    };
    _extends(TokenKeyword, Token);
    
    TokenKeyword.prototype.getCode = function() {
      return this.code;
    };
    
    TokenKeyword.prototype.clone = function() {
      return new TokenKeyword(this.toString(), this.getPos(), this.getCode());
    };
    
    /**
     * Token operator
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     * @param {[type]} op  [description]
     */
    var TokenOperator = function(token, pos, op) {
      Token.call(this, TTOKEN.OPERATOR, token, pos);
      this.op    = op;
    };
    _extends(TokenOperator, Token);
    
    TokenOperator.prototype.getOperator = function() {
      return this.op;
    };
    
    TokenOperator.prototype.getPrecedence = function() {
      return _precedence[this.token] !== undefined ? _precedence[this.token] : null;
    };
    
    TokenOperator.prototype.is = function(op_code) {
      return this.op === op_code;
    };
    
    TokenOperator.prototype.clone = function() {
      return new TokenOperator(this.toString(), this.getPos(), this.getOperator());
    };
    
    
    var Lex = function(input) {
    
      var _input      = input;
      var _prev_token = null;
      var _back_token = null;
      var _last_error = null;
    
      var _isStopChar = function(ch) {
        return _stopchars.indexOf(ch) !== -1;
      };
    
      var _getString = function(begin_quote, start_from, input) {
        var str = '';
        var j = start_from + 1; // skip quote
        var complete = false;
    
        for(j; j < input.buf_len; j++) {
          if( (begin_quote === QUOTE.DOUBLE && input.buf[j] === '"') || (begin_quote === QUOTE.SINGLE && input.buf[j] === '\'')) {
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
    
      var _getOp = function(token, input) {
        var op_code = null;
    
        switch(token) {
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
            }
            break;
          case '(':
            op_code = OPERATOR.OPEN_PAR;
            break;
          case ')':
            op_code = OPERATOR.CLOSE_PAR;
            break;
          case '+':
            op_code = OPERATOR.SUM;
            break;
          case '-':
            op_code = OPERATOR.DIF;
            break;
          case '*':
            op_code = OPERATOR.MUL;
            break;
          case '/':
            op_code = OPERATOR.DIV;
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
          token: token
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
    
      var _readNextToken = function(input) {
        var token = '';
        for(var i = input.pos; i < input.buf_len; i++) {
          var ch = input.buf[i];
    
          if(_isStopChar(ch)) {
            if(token.length === 0) {
    
              if(ch === '.' && _isDigit(_nextChar(input))) {
                token += '0' + ch;
                continue;
              }
              if(_prev_token === null && (ch === '-' || ch === '+') && _isDigit(_nextChar(input))) {
                token += ch;
                continue;
              }
            /*  if( _prev_token !== null &&
                  _prev_token.getType() === 'OPERATOR' &&
                  (_prev_token.getOperator() === OPERATOR.CLOSE_PAR || _prev_token.getOperator() === OPERATOR.CLOSE_PAR) &&
                  (ch === '-' || ch === '+') &&
                  _isDigit(_nextChar(input))) {
                token += ch;
                continue;
              }*/
    
              if(ch === '"') {
                var begin_pos = input.pos;
                var str = _getString(QUOTE.DOUBLE, begin_pos, input);
                if(str === null) {
                  _last_error = new LexError('', begin_pos, ERROR.PARSE_STRING.CODE, ERROR.PARSE_STRING.DEF);
                  return null;
                }
                return new TokenConst(str, begin_pos, CONST.STRING);
              }else if(ch === '\'') {
                var begin_pos = input.pos;
                var str = _getString(QUOTE.SINGLE, begin_pos, input);
                if(str === null) {
                  _last_error = new LexError('', begin_pos, ERROR.PARSE_STRING.CODE, ERROR.PARSE_STRING.DEF);
                  return null;
                }
                return new TokenConst(str, begin_pos, CONST.STRING);
              }
    
              var op = _getOp(ch, input);
              if(op.code === null) {
                _last_error = new LexError(ch, input.pos, ERROR.UNKNOWN_OPERATOR.CODE, ERROR.UNKNOWN_OPERATOR.DEF);
                return null;
              }
              input.pos++;
              return new TokenOperator(op.token, input.pos, op.code);
            }else {
              if((ch === '.' || _isDigit(ch)) && token.match(/([0-9])/)) {
                token += ch;
                continue;
              }
              break;
            }
          }
    
          token += ch;
        }
    
        input.pos += token.length;
        if(token.length === 0) {
          return null;
        }
    
        var kw_code = _isKeyword(token);
        if(kw_code !== null) {
          return new TokenKeyword(token, input.pos - token.length, kw_code);
        }
    
        var op = _getOp(token);
        if(op.code !== null) {
          return new TokenOperator(token, input.pos - token.length, op.code);
        }
    
        if(token.match(/(^|[ \t])([-+]?(\d+|\.\d+|\d+\.\d*))($|[^+-.])/)) {
          if(isNaN(+token)) {
            _last_error = new LexError(token, input.pos - token.length, ERROR.BAD_NUMBER.CODE, ERROR.BAD_NUMBER.DEF);
            return null;
          }
          return new TokenConst(token, input.pos - token.length, CONST.NUMBER);
        }
    
        if(!token.match(/^_?([_a-zA-Z])+$/)) {
          _last_error = new LexError(token, input.pos - token.length, ERROR.BAD_IDENTIFER.CODE, ERROR.BAD_IDENTIFER.DEF);
          return null;
        }
    
        return new TokenIdentifer(token, input.pos - token.length);
      };
    
      this.getToken = function() {
        if(_back_token !== null) {
          var t = _back_token.clone();
          _back_token = null;
          return t;
        }
        _prev_token = _readNextToken(_input);
        return _prev_token;
      };
    
      this.putback = function(token) {
        _back_token = token;
      };
    
      this.getLastError = function() {
        return _last_error;
      };
    
    };
    
    /*=require ../common.js*/
    var ASTNODE = {
      EXPR:           0,
      FUNCTION_CALL:  1,
      CONST:          2,
      VARIABLE:       3,
      MEMBER_OF_OBJ:  4
    };
    
    /**
     * @param {[type]} type [description]
     */
    var ASTNode = function(type) {
      this.type = type;
    };
    ASTNode.prototype.getType = function() {
      return this.type;
    };
    ASTNode.prototype.isExpr = function() {
      return this.type === ASTNODE.EXPR;
    };
    ASTNode.prototype.isFunctionCall = function() {
      return this.type === ASTNODE.FUNCTION_CALL;
    };
    ASTNode.prototype.isConst = function() {
      return this.type === ASTNODE.CONST;
    };
    ASTNode.prototype.isVariable = function() {
      return this.type === ASTNODE.VARIABLE;
    };
    ASTNode.prototype.isMemberOfObj = function() {
      return this.type === ASTNODE.MEMBER_OF_OBJ;
    };
    ASTNode.prototype.execute = function(scope) {
      return null;
    };
    
    /**
     * @param {[type]} val  [description]
     * @param {[type]} type [description]
     */
    var ASTNodeConst = function(val, type) {
      ASTNode.call(this, ASTNODE.CONST);
      this.val = val;
      this.type = type;
    };
    _extends(ASTNodeConst, ASTNode);
    
    ASTNodeConst.prototype.getDataType = function() {
      return this.type;
    };
    
    ASTNodeConst.prototype.execute = function(scope) {
      if(this.type === CONST.NUMBER) {
        return +this.val;
      }
      return this.val;
    };
    
    /**
     * @param {[type]} name [description]
     * @param {[type]} args [description]
     */
    var ASTNodeFunc = function(name, args) {
      ASTNode.call(this, ASTNODE.FUNCTION_CALL);
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
    var ASTNodeVariable = function(name) {
      ASTNode.call(this, ASTNODE.VARIABLE);
      this.name = name;
    };
    _extends(ASTNodeVariable, ASTNode);
    
    ASTNodeVariable.prototype.getName = function() {
      return this.name;
    };
    
    ASTNodeVariable.prototype.execute = function(scope) {
      return scope[this.name] || null;
    };
    
    /**
     * @param {[type]} operator      [description]
     * @param {[type]} left_operand  [description]
     * @param {[type]} right_operand [description]
     */
    var ASTNodeExpr = function(operator, left_operand, right_operand) {
      ASTNode.call(this, ASTNODE.EXPR);
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
     * @param {[type]} name [description]
     */
    var ASTNodeMemberOfObj = function(obj_name, next) {
      ASTNode.call(this, ASTNODE.MEMBER_OF_OBJ);
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
    
    
    var Parser = function() {
    
      var _ast = null;
    
      function _token2astnode(token) {
        switch(token.getType()) {
          case TTOKEN.IDENTIFER: return new ASTNodeVariable(token.toString());
          case TTOKEN.CONST: return new ASTNodeConst(token.toString(), token.getDataType());
        }
        return null;
      };
    
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
        var args = [];
        var buf = [];
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
    
      function _processOperator(token, operators, operands) {
        if(operators.length === 0) {
          operators.push(token);
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
          case TTOKEN.IDENTIFER:
            return _processIdentifer(token, lex);
          case TTOKEN.CONST:
            return _processConst(token);
        }
        return null;
      };
    
      function _process(token, lex, operators, operands) {
        switch(token.getType()) {
          case TTOKEN.IDENTIFER:
               operands.push(_processToken(token, lex));
            break;
          case TTOKEN.CONST:
              operands.push(_processToken(token, lex));
            break;
          case TTOKEN.OPERATOR:
              _processOperator(token, operators, operands);
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
        }
    
        if(lex.getLastError() !== null) {
          return null;
        }
    
        while(operators.length != 0) {
          operands.push(_createBinExprNode(operators, operands));
        }
    
        if(operands.length === 1) {
          return operands[0];
        }
    
        return null;
      };
    
      this.parse = function(lex) {
        _ast = _parseExpr(lex);
        return _ast !== null;
      };
    
      this.getLastError = function() {
    
      };
    
      this.getAST = function() {
        return _ast;
      };
    };
    

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
            console.log('Lex-Error<' + lerr.getCode() + '>: ' + lerr.getDef() + ' in token<' + lerr.getToken() + '>' + ' at ' + (lerr.getPos() + 1) + ' pos');
            return null;
          }

          var perr = parser.getLastError();
          if(perr !== null) {
            // console.log
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

    /*******************************************************************************************************************
     * Module public interface
     */
    return {
      parse: parse
    };

  })();

  if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = jsexpr;
  }else {
    window['jsexpr'] = jsexpr;
  }

})();
