/*=require ../common.js*/
/*=require node/node.js*/
/*=require node/const.js*/
/*=require node/func.js*/
/*=require node/variable.js*/
/*=require node/expr.js*/
/*=require node/member-obj.js*/

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
