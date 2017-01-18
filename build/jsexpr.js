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
      '(': 0,
      ')': 1,
      '||': 2, 'or': 2,
      '&&': 3, 'and': 3,
      '<': 4, '>': 4, '<=': 4, '>=': 4, '==': 4, '!=': 4, '?': 4,
      '+':  5, '-': 5,
      '*':  6, '/': 6
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
    
        if(!token.match(/^_?([a-zA-Z])+$/)) {
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
      VARIABLE:       3
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
      console.log(this.args)
      return null;
    };
    
    /**
     * @param {[type]} name [description]
     */
    var ASTNodeVariable = function(name) {
      ASTNode.call(this, ASTNODE.VARIABLE);
      this.name = name;
    };
    _extends(ASTNodeVariable, ASTNode);
    
    ASTNodeVariable.prototype.getValueByPath = function(path, scope) {
      var chunks = path.split('.');
      var len = chunks.length;
      var v = scope;
      for(var i = 0 ; i < len; i++) {
        v = v[chunks[i]];
        if(v === undefined) {
          break;
        }
      }
      return v;
    };
    
    ASTNodeVariable.prototype.getName = function() {
      return this.name;
    };
    
    ASTNodeVariable.prototype.execute = function(scope) {
      if(this.name.indexOf('.') != -1) {
        return this.getValueByPath(this.name, scope);
      }
      return scope[this.name];
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
    
    ASTNodeExpr.prototype.execute = function(scope) {
      var vleft   = this.left.execute(scope);
      var vright  = this.right.execute(scope);
      switch(this.op) {
        case OPERATOR.SUM: return vleft + vright;
        case OPERATOR.DIF: return vleft - vright;
        case OPERATOR.MUL: return vleft * vright;
        case OPERATOR.DIV: return vleft / vright;
        case OPERATOR.GT: return vleft > vright;
        case OPERATOR.LT: return vleft < vright;
        case OPERATOR.EQ: return vleft == vright;
        case OPERATOR.GET: return vleft >= vright;
        case OPERATOR.LET: return vleft <= vright;
        case OPERATOR.AND: return vleft && vright;
        case OPERATOR.OR: return vleft || vright;
        case OPERATOR.NEQ: return vleft != vright;
      }
      return null;
    };
    
    
    var Parser = function(lex) {
      var _lex        = lex;
      var _operands   = [];
      var _operators  = [];
    
      var _token2astnode = function(token) {
        switch(token.getType()) {
          case TTOKEN.IDENTIFER: return new ASTNodeVariable(token.toString());
          case TTOKEN.CONST: return new ASTNodeConst(token.toString(), token.getDataType());
        }
        return null;
      };
    
      var _createExprNode = function(operators, operands) {
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
    
      var _buildAST = function(chain) {
      };
    
      function _processFunction(token, lex) {
        var fname = token.toString();
        var pos = token.getPos();
        var args = [];
        var buf = [];
        var par_cnt = 0;
        lex.getToken(); // Skip '('
    
        for(;;) {
          var token = lex.getToken();
    
          if(token === null) {
            break;
          }
    
          if(token.isOperator()) {
            if(token.getOperator() === OPERATOR.COMMA) {
              if(buf.length === 0) {
                // Error
              }
              args.push(buf.slice());
              buf = [];
              continue;
            }else if(token.getOperator() === OPERATOR.CLOSE_PAR) {
              if(par_cnt === 0) {
                if(buf.length === 0) {
                  // Error
                }
                args.push(buf.slice());
                buf = [];
                break; // End of function call
              }else {
                buf.push(token);
                par_cnt--;
              }
            }else if(token.getOperator() === OPERATOR.OPEN_PAR) {
              buf.push(token);
              par_cnt++;
            }else if(token.getOperator() === OPERATOR.WS) {
              continue;
            }
          }
    
          if(token.isIdentifer()) {
            token = _processIdentifer(token, lex);
          }else if(token.isConst()) {
            token = _token2astnode(token);
          }
    
          buf.push(token);
        }
    
        var alen = args.length;
        for(var i = 0 ; i < alen; i++) {
          var chain_len = args[i].length;
          if(chain_len === 1) {
            args[i] = args[i][0];
          }else if(chain_len > 0) {
            args[i] = _buildAST(args[i]);
          }
        }
    
        return new ASTNodeFunc(fname, args);
      };
    
      function _processStruct(token, lex) {
        var ident = token.toString();
        var pos = token.getPos();
        for(;;) {
          var token = lex.getToken();
          if(token === null) {
            break;
          }
    
          if( (token.isOperator() && token.getOperator() === OPERATOR.DOT) || token.isIdentifer()) {
            ident += token.toString();
            continue;
          }
    
          lex.putback(token);
          break;
        }
        return new ASTNodeVariable(ident);
      };
    
      function _processIdentifer(token, lex) {
        var ident   = token.toString();
        var pos     = token.getPos();
        var nexttok = lex.getToken();
        lex.putback(nexttok);
        if(nexttok.isOperator() && nexttok.getOperator() === OPERATOR.OPEN_PAR) {
          return _processFunction(token, lex);
        }
        if(nexttok.isOperator() && nexttok.getOperator() === OPERATOR.DOT) {
          return _processStruct(token, lex);
        }
        return new ASTNodeVariable(ident);
      };
    
      function _processConst(token) {
        return _token2astnode(token);
      };
    
      function _processOperator(token) {
        if(_operators.length === 0) {
          _operators.push(token);
        }else {
          var operator = _operators[_operators.length - 1];
          if(token.getOperator() === OPERATOR.OPEN_PAR || token.getPrecedence() > operator.getPrecedence()) {
            _operators.push(token);
          }else if(token.getOperator() === OPERATOR.CLOSE_PAR) {
            for(;;) {
              var operator = _operators.pop();
              if(operator.getOperator() === OPERATOR.OPEN_PAR) {
                break;
              }
              var right_operand = _operands.pop();
              var left_operand = _operands.pop();
              _operands.push(new ASTNodeExpr(operator.getOperator(), left_operand, right_operand));
            }
         }else {
           _operands.push(_createExprNode(_operators, _operands));
           _operators.push(token);
         }
        }
      };
    
      this.lookup = function(token) {
        switch(token.getType()) {
          case TTOKEN.IDENTIFER:
               var node = _processIdentifer(token, _lex);
               _operands.push(node);
            break;
          case TTOKEN.CONST:
              var node = _processConst(token);
              _operands.push(node);
            break;
          case TTOKEN.OPERATOR:
              _processOperator(token);
            break;
        }
      };
    
      this.getLastError = function() {
    
      };
    
      this.getAST = function() {
        while(_operators.length != 0) {
          _operands.push(_createExprNode(_operators, _operands));
        }
      };
    };
    

    /**
     * @param {[type]} ast_node_root [description]
     */
    var JSExpr = function(ast_node_root) {
      this.ast_root = ast_node_root;
    };

    JSExpr.prototype.execute = function(scope) {
      if(this.ast_root !== undefined && this.ast_root !== null) {
        return this.ast_root.execute(scope);
      }
      return null;
    };

    /**
      * ----------------------------------------------------------------------------------------------------------------
      * Private methods
      * ----------------------------------------------------------------------------------------------------------------
      */
      var _parse = function(input) {
        var lex    = new Lex(input);
        var parser = new Parser(lex);

        for(;;) {
          var token = lex.getToken();
          if(token === null) {
            break;
          }
          if(token.isOperator() && token.getOperator() === OPERATOR.WS) {
            continue;
          }
          parser.lookup(token);
        }

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

        return new JSExpr(parser.getAST());
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
