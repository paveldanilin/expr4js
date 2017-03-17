/*-require ../common.js*/
/*=require error.js*/
/*=require node/node.js*/
/*=require node/const.js*/
/*=require node/func.js*/
/*=require node/variable.js*/
/*=require node/expr.js*/
/*=require node/uexpr.js*/
/*=require node/member-obj.js*/

var Parser = function()
{
  var _ast = null;
  var _last_error = null;

  function _token2astnode(token) {
    switch(token.getType()) {
      case TOKEN_TYPE.IDENTIFER: return new ASTNodeVariable(token.toString());
      case TOKEN_TYPE.CONST: return new ASTNodeConst(token.toString(), token.getDataType());
      default:
        _last_error = ParserError.create(4, "Unexpected token", token);
      break;
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

  function _createUnaryExprNode(operators, operands) {
    var operator = operators.pop();
    var operand = operands.pop();
    if(operand instanceof Token) {
      operand = _token2astnode(operand);
    }
    return ;
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

  function _processOperator(token, operators, operands, lex) {
    if(operators.length === 0) {
      var is_save_token = true;
      if(token.isUnary()) {
        var nexttok = lex.getToken();
        if(nexttok === null) {
          _last_error = ParserError.create(3, "Unexpected end of tokens sequence", null);
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
        _last_error = ParserError.create(2, "Unexpected token", token);
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
          operands.push(_processToken(token, lex));
        break;
      case TOKEN_TYPE.OPERATOR:
          _processOperator(token, operators, operands, lex);
        break;
      default:
          _last_error = ParserError.create(1, "Unexpected token", token);
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

    _last_error = ParserError.create(666, "Unable to parse expression", null);

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
