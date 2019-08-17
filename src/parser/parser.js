import ParserError from './error';
import ASTNode from './node/node';
import ASTNodeConst from './node/const';
import ASTNodeExpr from './node/expr';
import ASTNodeFunc from './node/func';
import ASTNodeMemberOfObj from './node/member-obj';
import ASTNodeUnaryExpr from './node/uexpr';
import ASTNodeVariable from './node/variable';
import Token from '../lex/token/token';
import TokenConst from '../lex/token/const';
import TokenIdentifer from '../lex/token/identifer';
import TOKEN_TYPE from '../lex/token/type';
//import OPERATOR from '../lex/token/operator';

export default class Parser {

  constructor() {
    this._ast = null;
    this._lastError = null;
  }

   _token2astnode(token) {
    switch(token.getType()) {
      case TOKEN_TYPE.IDENTIFER: return new ASTNodeVariable(token.toString());
      case TOKEN_TYPE.CONST: return new ASTNodeConst(token.toString(), token.getDataType());
      default:
        this._lastError = ParserError.UnexpectedToken(token);
      break;
    }
    return null;
  }

   _createBinExprNode(operators, operands) {
    const operator = operators.pop();

    let rightOperand = operands.pop();
    let leftOperand = operands.pop();

    if(rightOperand instanceof Token) {
      rightOperand = this._token2astnode(rightOperand);
    }

    if(leftOperand instanceof Token) {
      leftOperand = this._token2astnode(leftOperand);
    }

    return new ASTNodeExpr(operator.getOperator(), leftOperand, rightOperand);
  }

  _buildAST(chain) {
    let operands   = [];
    let operators  = [];
    const len = chain.length;

    for(let i = 0 ; i < len ; i++) {
      const n = chain[i];

      if(n instanceof ASTNode) {
        operands.push(n);
      }else {
        if(operators.length === 0) {
          operators.push(n);
        }else {
          this._processOperators(n, operators, operands);
        }
      }
    }

    while(operators.length !== 0) {
      operands.push(this._createBinExprNode(operators, operands));
    }

    if(operands.length === 1) {
      return operands[0];
    }

    return null;
  }

  _processFunction(token, lex) {

    const args = []; // AST nodes. Before build ASTNodeFunc - build AST noes for arguments.
    let buf = []; // Tokens buffer
    let parCnt = 0;
    lex.getToken(); // Skip '('


    for(;;) {
      const t = lex.getToken();

      if(t === null) {
        break;
      }

      if(t.isOperator()) {
        if(t.isComma()) {
          if(buf.length === 0) {
            // Error
            return null;
          }
          args.push(this._buildAST(buf.slice()));
          buf = [];
          continue;
        }else if(t.isClosePar()) {
          if(parCnt === 0) {
            if(args.length > 0 && buf.length === 0) {
              // Error
              return null;
            }
            if(buf.length > 0) {
              args.push(this._buildAST(buf.slice()));
            }
            buf = [];
            break; // End of function call
          }else {
            buf.push(token);
            parCnt--;
          }
        }else if(t.isOpenPar()) {
          buf.push(token);
          parCnt++;
        }else if(t.isWhiteSpace()) {
          continue;
        }
        buf.push(t);
        continue;
      }

      buf.push(this._processToken(t, lex));
    }

    if(args.length > 0) {
      //console.log('<' + fname + '> args: ' + JSON.stringify(args));
    }else {
      //console.log('<' + fname + '> no args');
    }

    return new ASTNodeFunc(token.toString(), args);
  }

  _processMemberOf(token, lex) {
    const ident = token.toString();
    lex.getToken(); // Skip '.'

    const nt = lex.getToken();
    if(nt === null || !nt.isIdentifer()) {
      return null;
    }

    const next = this._processIdentifer(nt, lex);
    return new ASTNodeMemberOfObj(ident, next);
  }

  _processIdentifer(token, lex) {
    const ident   = token.toString();
    const nexttok = lex.getToken();

    if(nexttok === null) {
      return new ASTNodeVariable(ident);
    }

    lex.putback(nexttok);
    if(nexttok.isOperator() && nexttok.isOpenPar()) {
      return this._processFunction(token, lex);
    }
    if(nexttok.isOperator() && nexttok.isDot()) {
      return this._processMemberOf(token, lex);
    }

    return new ASTNodeVariable(ident);
  }

  _processConst(token) {
    return this._token2astnode(token);
  }

  _processOperator(token, operators, operands, lex) {

    if(operators.length === 0) {
      let isSaveToken = true;

      if(token.isUnary()) {

        const nexttok = lex.getToken();

        if(nexttok === null) {
          this._lastError = ParserError.UnexpectedTokenSeq();
          return null;
        }

        if(nexttok instanceof TokenConst) {
          operands.push(new ASTNodeUnaryExpr(token.getOperator(), this._processConst(nexttok)));
          isSaveToken = false;
        }else if(nexttok instanceof TokenIdentifer) {
          operands.push(new ASTNodeUnaryExpr(token.getOperator(), this._processIdentifer(nexttok, lex)));
          isSaveToken = false;
        }else {
          lex.putback(nexttok);
        }
      }

      if(isSaveToken) {
        operators.push(token);
      }

    }else {
      this._processOperators(token, operators, operands);
    }
  }

  _processOperators(token, operators, operands) {
    const operator = operators[operators.length - 1];

    if(token.isOpenPar() || token.getPrecedence() > operator.getPrecedence()) {
      operators.push(token);
    }else if(token.isClosePar()) {
      for(;;) {
        const operator = operators.pop();
        if(operator.isOpenPar()) {
          break;
        }

        const rightOperand = operands.pop();
        const leftOperand = operands.pop();

        operands.push(new ASTNodeExpr(operator.getOperator(), leftOperand, rightOperand));
      }
    }else {
      operands.push(this._createBinExprNode(operators, operands));
      operators.push(token);
    }
  }

  _processToken(token, lex) {
    switch(token.getType()) {
      case TOKEN_TYPE.IDENTIFER:
        return this._processIdentifer(token, lex);
      case TOKEN_TYPE.CONST:
        return this._processConst(token);
      default:
        this._lastError = ParserError.UnexpectedToken(token);
        break;
    }
    return null;
  }

  _process(token, lex, operators, operands) {
    switch(token.getType()) {
      case TOKEN_TYPE.IDENTIFER:
           operands.push(this._processToken(token, lex));
        break;
      case TOKEN_TYPE.CONST:
          operands.push(this._processConst(token, lex));
        break;
      case TOKEN_TYPE.OPERATOR:
          this._processOperator(token, operators, operands, lex);
        break;
      default:
          this._lastError = ParserError.UnexpectedToken(token);
      break;
    }
  }

  _parseExpr(lex) {
    let operands = [];
    let operators = [];

    for(;;) {
      const token = lex.getToken();

      if(token === null) {
        break;
      }

      if(token.isOperator() && token.isWhiteSpace()) {
        continue;
      }

      this._process(token, lex, operators, operands);

      if(this._lastError !== null) {
        return null;
      }
    }

    if(lex.getLastError() !== null) {
      this._lastError = lex.getLastError();
      return null;
    }

    while(operators.length !== 0) {
      operands.push(this._createBinExprNode(operators, operands));
    }

    if(operands.length === 1) {
      return operands[0];
    }

    this._lastError = ParserError.UnableParseExpr();

    return null;
  }

  parse(lex) {
    this._ast = this._parseExpr(lex);
    return this._ast !== null;
  }

  getLastError() {
    return this._lastError;
  }

  getAST() {
    return this._ast;
  }
}
