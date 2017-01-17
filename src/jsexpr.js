/***********************************************************************************************************************
* Javascript-Expression parser
* Version: 0.1
***********************************************************************************************************************/

(function () {

  var jsexpr = (function () {

    var TTOKEN = {
      ERROR:      0,
      IDENTIFER:  1,
      CONST:      2,
      OPERATOR:   3,
      KEYWORDS:   4
    };

    var ASTNODE = {
      EXPR:           0,
      FUNCTION_CALL:  1,
      CONST:          2,
      VARIABLE:       3
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

    var _keywords = {
    };
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
    var _prev_token = null;
    var _back_token = null;

    var _extends = function(child, parent) {
      child.prototype = Object.create(parent.prototype);
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
      }
    };

    /**
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     * @param {[type]} err   [description]
     */
    var TokenError = function(token, pos, err) {
      Token.call(this, TTOKEN.ERROR, token, pos);
      this.ecode = err.CODE;
      this.edef = err.DEF;
    };
    _extends(TokenError, Token);

    TokenError.prototype.getErrorCode = function() {
      return this.ecode;
    };

    TokenError.prototype.getErrorDef = function() {
      return this.edef;
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

    /**
     * Token const
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     * @param {[type]} op  [description]
     */
    var TokenConst = function(token, pos, dtype) {
      Token.call(this, TTOKEN.CONST, token, pos);
      this.dtype  = dtype;
    };
    _extends(TokenConst, Token);

    TokenConst.prototype.getDataType = function() {
      return this.dtype;
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
    ASTNode.prototype.execute = function(scope) {
      return null;
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

      /**
      * LEXER
      */

      var _copyToken = function(token) {
        switch(token.getType()) {
          case TTOKEN.IDENTIFER: return new TokenIdentifer(token.toString(), token.getPos());
          case TTOKEN.OPERATOR: return new TokenOperator(token.toString(), token.getPos(), token.getOperator());
          case TTOKEN.CONST: return new TokenOperator(token.toString(), token.getPos(), token.getDataType());
        }
        return null;
      };

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
                  return new TokenError('', begin_pos, ERROR.PARSE_STRING);
                }
                return new TokenConst(str, begin_pos, CONST.STRING);
              }else if(ch === '\'') {
                var begin_pos = input.pos;
                var str = _getString(QUOTE.SINGLE, begin_pos, input);
                if(str === null) {
                  return new TokenError('', begin_pos, ERROR.PARSE_STRING);
                }
                return new TokenConst(str, begin_pos, CONST.STRING);
              }

              var op = _getOp(ch, input);
              if(op.code === null) {
                return new TokenError(ch, input.pos, ERROR.UNKNOWN_OPERATOR);
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
            return new TokenError(token, input.pos - token.length, ERROR.BAD_NUMBER);
          }
          return new TokenConst(token, input.pos - token.length, CONST.NUMBER);
        }

        if(!token.match(/^_?([a-zA-Z])+$/)) {
          return new TokenError(token, input.pos - token.length, ERROR.BAD_IDENTIFER);
        }

        return new TokenIdentifer(token, input.pos - token.length);
      };

      var _getToken = function(input) {
        if(_back_token !== null) {
          var t = _copyToken(_back_token);
          _back_token = null;
          return t;
        }
        _prev_token = _readNextToken(input);
        return _prev_token;
      };

      var _putbackToken = function(token) {
        _back_token = token;
      }

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

      function _processFunction(token, input) {
        var fname = token.toString();
        var pos = token.getPos();
        var args = [];
        var buf = [];
        var par_cnt = 0;
        _getToken(input); // Skip '('

        for(;;) {
          var token = _getToken(input);

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
            token = _processIdentifer(token, input);
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

      function _processStruct(token, input) {
        var ident = token.toString();
        var pos = token.getPos();
        for(;;) {
          var token = _getToken(input);
          if(token === null) {
            break;
          }

          if( (token.isOperator() && token.getOperator() === OPERATOR.DOT) || token.isIdentifer()) {
            ident += token.toString();
            continue;
          }

          _putbackToken(token);
          break;
        }
        return new ASTNodeVariable(ident);
      };

      function _processIdentifer(token, input) {
        var ident = token.toString();
        var pos = token.getPos();
        var nexttok = _getToken(input);
        _putbackToken(nexttok);

        if(nexttok.isOperator() && nexttok.getOperator() === OPERATOR.OPEN_PAR) {
          return _processFunction(token, input);
        }

        if(nexttok.isOperator() && nexttok.getOperator() === OPERATOR.DOT) {
          return _processStruct(token, input);
        }
        return new ASTNodeVariable(ident);
      };


      var _parse = function(input) {
        var operands = [];
        var operators = [];

        for(;;) {
          var token = _getToken(input);

          if(token === null) {
            while(operators.length != 0) {
              operands.push(_createExprNode(operators, operands));
             }
            break;
          }

          if(token.isError()) {
            console.log('Lex-Error<' + token.getErrorCode() + '>: ' + token.getErrorDef() + ' in token<' + token.toString() + '>' + ' at ' + (token.getPos() + 1) + ' pos');
            break;
          }

          if(token.isOperator() && token.getOperator() === OPERATOR.WS) {
            // Skip white space
            continue;
          }

          if(token.isIdentifer()) {
            token = _processIdentifer(token, input);
          }else if(token.isConst()) {
            token = new ASTNodeConst(token.toString(), token.getDataType());
          }
          //console.log(token);

          if(token instanceof ASTNode /*|| token.isIdentifer() || token.isConst()*/) {
            operands.push(token);
            continue;
          }

          if(token.isOperator()) {
            if(operators.length === 0) {
              operators.push(token);
            }else {
              var operator = operators[operators.length - 1];
              if(token.getOperator() === OPERATOR.OPEN_PAR || token.getPrecedence() > operator.getPrecedence()) {
                operators.push(token);
              }else if(token.getOperator() === OPERATOR.CLOSE_PAR) {
                for(;;) {
                   var operator = operators.pop();
                   if(operator.getOperator() === OPERATOR.OPEN_PAR) {
                     break;
                   }
                   var right_operand = operands.pop();
                   var left_operand = operands.pop();
                   operands.push(new ASTNodeExpr(operator.getOperator(), left_operand, right_operand));
                }
              }else {
                operands.push(_createExprNode(operators, operands));
                operators.push(token);
              }
            }
          }

        }

        if(operands.length === 1 && operands[0] instanceof ASTNode) {
          return new JSExpr(operands[0]);
        }

        return null;
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
