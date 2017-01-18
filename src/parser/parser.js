/*=require ../common.js*/
/*=require node/node.js*/
/*=require node/const.js*/
/*=require node/func.js*/
/*=require node/variable.js*/
/*=require node/expr.js*/

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
