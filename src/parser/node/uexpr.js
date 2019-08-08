import ASTNode from './node';
import AST_NODE_TYPE from './type';
import OPERATOR from '../../lex/operator';

export default class ASTNodeUnaryExpr extends ASTNode {
  constructor(operator, operand) {
    super(AST_NODE_TYPE.UNARY_EXPR);
    this.op = operator;
    this.operand = operand;
  }

  toString() {
    return this.op + '(' + this.operand.toString() + ')';
  }

  execute(scope) {
    if(this.op === OPERATOR.NOT) {
      return !this.operand.execute(scope);
    }
    return null;
  }
}
