/***********************************************************************************************************************
* Javascript-Expression parser / performer
* Version: 0.1
*-----------------------------------------------------------------------------------------------------------------------
* 17.01.2017 - Added build expr tree (ASTNodeExpr) and  executor (JSExpr)
* 16.01.2017 - Created
***********************************************************************************************************************/

(function () {

  var jsexpr = (function () {

    var OP_GT = 100;  // >
    var OP_LT = 101;  // <
    var OP_GET = 102; // >=
    var OP_LET = 103; // <=
    var OP_EQ  = 104; // ==
    var OP_DOT = 105; // .
    var OP_WS = 106; // ' '
    var OP_AND = 107; // and
    var OP_OR = 108; // or
    var OP_SUM = 109; // +
    var OP_DIV = 110; // /
    var OP_DIF = 111; // -
    var OP_MUL = 112; // *
    var OP_OPEN_PHAR = 113; // (
    var OP_CLOSE_PHAR = 114; // )

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

    var CONST_STRING = 10000;
    var CONST_NUMBER = 10001;

    var SINGLE_QUOTE = 1;
    var DOUBLE_QUOTE = 2;

    var _keywords = {
    };
    var _stopchars = ['!', '=', '>', '<', '"', '\'', '.', ' ', '(', ')', ',', '*', '+', '-'];
    var _precedence = {
      '(': 0,
      ')': 1,
      '||': 2, 'or': 2,
      '&&': 3, 'and': 3,
      '<': 4, '>': 4, '<=': 4, '>=': 4, '==': 4,
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
      }
    };

    var TokenError = function(token, pos, err) {
      Token.call(this, "ERROR", token, pos);
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
      Token.call(this, "IDENTIFER", token, pos);
    };
    _extends(TokenIdentifer, Token);

    /**
     * Token operator
     * @param {[type]} token [description]
     * @param {[type]} pos   [description]
     * @param {[type]} op  [description]
     */
    var TokenOperator = function(token, pos, op) {
      Token.call(this, "OPERATOR", token, pos);
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
      Token.call(this, "CONST", token, pos);
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
      Token.call(this, "KEYWORD", token, pos);
      this.code  = code;
    };
    _extends(TokenKeyword, Token);

    TokenKeyword.prototype.getCode = function() {
      return this.code;
    };

    /**
     * @param {[type]} operator      [description]
     * @param {[type]} left_operand  [description]
     * @param {[type]} right_operand [description]
     */
    var ASTNodeExpr = function(operator, left_operand, right_operand) {
      this.op = operator;
      this.left = left_operand;
      this.right = right_operand;
    };

    ASTNodeExpr.prototype.toString = function() {
      return this.op.toString() + '(' + this.left.toString() + ',' + this.right.toString() + ')';
    };

    ASTNodeExpr.prototype.getValueByPath = function(path, scope) {
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

    ASTNodeExpr.prototype.getOperandValue = function(operand, scope) {
      if(operand instanceof ASTNodeExpr) {
        return operand.execute(scope);
      }else if(operand instanceof TokenConst) {
        var v = operand.toString();
        if(operand.getDataType() == CONST_NUMBER) {
          v = +v; // To number
        }
        return v;
      }else if(operand instanceof TokenIdentifer) {
        var identifer = operand.toString();
        // a.b.c
        if(identifer.indexOf('.') != -1) {
          return this.getValueByPath(identifer, scope);
        }
        return scope[identifer];
      }
      return null;
    };

    ASTNodeExpr.prototype.execute = function(scope) {
      var vleft = this.getOperandValue(this.left, scope);
      var vright = this.getOperandValue(this.right, scope);
      switch(this.op.getOperator()) {
        case OP_SUM: return vleft + vright;
        case OP_DIF: return vleft - vright;
        case OP_MUL: return vleft * vright;
        case OP_DIV: return vleft / vright;
        case OP_GT: return vleft > vright;
        case OP_LT: return vleft < vright;
        case OP_EQ: return vleft == vright;
        case OP_GET: return vleft >= vright;
        case OP_LET: return vleft <= vright;
        case OP_AND: return vleft && vright;
        case OP_OR: return vleft || vright;
      }
      return null;
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
          case 'IDENTIFER': return new TokenIdentifer(token.toString(), token.getPos());
          case 'OPERATOR': return new TokenOperator(token.toString(), token.getPos(), token.getOperator());
          case 'CONST': return new TokenOperator(token.toString(), token.getPos(), token.getDataType());
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
          if( (begin_quote === DOUBLE_QUOTE && input.buf[j] === '"') || (begin_quote === SINGLE_QUOTE && input.buf[j] === '\'')) {
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
          case '(':
            op_code = OP_OPEN_PHAR;
            break;
          case ')':
            op_code = OP_CLOSE_PHAR;
            break;
          case '+':
            op_code = OP_SUM;
            break;
          case '-':
            op_code = OP_DIF;
            break;
          case '*':
            op_code = OP_MUL;
            break;
          case '/':
            op_code = OP_DIV;
            break;
          case "and":
              op_code = OP_AND;
            break;
          case "or":
              op_code = OP_OR;
            break;
          case ">":
            if(_nextChar(input) === '=') {
              input.pos++;
              token += '=';
              op_code = OP_GET;
            }else {
              op_code = OP_GT;
            }
            break;
          case "<":
            if(_nextChar(input) === '=') {
              input.pos++;
              token += '=';
              op_code = OP_LET;
            }else {
              op_code = OP_LT;
            }
            break;
          case "=":
            if(_nextChar(input) === '=') {
              input.pos++;
              token += '=';
              op_code = OP_EQ;
            }
            break;
          case ".":
            op_code = OP_DOT;
            break;
          case " ":
            op_code = OP_WS;
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

      var _getToken = function(input) {
        if(_back_token !== null) {
          var t = _copyToken(_back_token);
          _back_token = null;
          return t;
        }
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
                  (_prev_token.getOperator() === OP_CLOSE_PHAR || _prev_token.getOperator() === OP_CLOSE_PHAR) &&
                  (ch === '-' || ch === '+') &&
                  _isDigit(_nextChar(input))) {
                token += ch;
                continue;
              }*/

              if(ch === '"') {
                var begin_pos = input.pos;
                var str = _getString(DOUBLE_QUOTE, begin_pos, input);
                if(str === null) {
                  return new TokenError('', begin_pos, ERROR.PARSE_STRING);
                }
                return new TokenConst(str, begin_pos, CONST_STRING);
              }else if(ch === '\'') {
                var begin_pos = input.pos;
                var str = _getString(SINGLE_QUOTE, begin_pos, input);
                if(str === null) {
                  return new TokenError('', begin_pos, ERROR.PARSE_STRING);
                }
                return new TokenConst(str, begin_pos, CONST_STRING);
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
          return new TokenConst(token, input.pos - token.length, CONST_NUMBER);
        }

        if(!token.match(/^_?([a-zA-Z])+$/)) {
          return new TokenError(token, input.pos - token.length, ERROR.BAD_IDENTIFER);
        }

        return new TokenIdentifer(token, input.pos - token.length);
      };

      var _putbackToken = function(token) {
        _back_token = token;
      }

      var _createExprNode = function(operators, operands) {
        var operator = operators.pop();
        var right_operand = operands.pop();
        var left_operand = operands.pop();
        //console.log(operator.toString() + ' NODE(' + left_operand.toString() + ',' + right_operand.toString() + ')');
        return new ASTNodeExpr(operator, left_operand, right_operand);
      };

      var _getIdentifer = function(token, input) {
        var ident = token.toString();
        var pos = token.getPos();
        for(;;) {
          var token = _getToken(input);

          if(token === null) {
            break;
          }

          if( (token.getType() === 'OPERATOR' && token.getOperator() === OP_DOT)  || token.getType() === 'IDENTIFER') {
            ident += token.toString();
            continue;
          }

          _putbackToken(token);
          break;
        }
        return new TokenIdentifer(ident, pos);
      };

    /**
     * -----------------------------------------------------------------------------------------------------------------
     * Module public methods
     * -----------------------------------------------------------------------------------------------------------------
     */

     var parse = function(expr) {

       var input = {
         buf: expr,
         buf_len: expr.length,
         pos: 0
       };

       var operands = [];
       var operators = [];

       for(;;) {
         var token = _getToken(input);
         _prev_token = token;

         if(token === null) {
           while(operators.length != 0) {
             operands.push(_createExprNode(operators, operands));
            }
           break;
         }

         if(token instanceof TokenError) {
           console.log('Lex-Error<' + token.getErrorCode() + '>: ' + token.getErrorDef() + ' in token<' + token.toString() + '>' + ' at ' + (token.getPos() + 1) + ' pos');
           break;
         }

         if(token.getType() === 'OPERATOR' && token.getOperator() === OP_WS) {
           // Skip white space
           continue;
         }

         if(token.getType() === 'IDENTIFER') {
           token = _getIdentifer(token, input);
         }

         if(token.getType() === 'IDENTIFER' || token.getType() === 'CONST') {
           operands.push(token);
           continue;
         }

         if(token.getType() === 'OPERATOR') {
           if(operators.length === 0) {
             operators.push(token);
           }else {
             var top_op = operators[operators.length - 1];
             if(token.getOperator() === OP_OPEN_PHAR || token.getPrecedence() > top_op.getPrecedence()) {
               operators.push(token);
             }else if(token.getOperator() === OP_CLOSE_PHAR) {
               for(;;) {
                  var operator = operators.pop();
                  if(operator.getOperator() === OP_OPEN_PHAR) {
                    break;
                  }
                  var right_operand = operands.pop();
                  var left_operand = operands.pop();
                  operands.push(new ASTNodeExpr(operator, left_operand, right_operand));
               }
             }else {
               operands.push(_createExprNode(operators, operands));
               operators.push(token);
             }
           }
         }

       }

       if(operands.length === 1 && operands[0] instanceof ASTNodeExpr) {
         return new JSExpr(operands[0]);
       }

       return null;
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
