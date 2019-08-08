import ASTNode from './node';
import AST_NODE_TYPE from './type';
import OPERATOR from '../../lex/operator';

export default class ASTNodeExpr extends ASTNode {
  constructor(operator, left_operand, right_operand) {
    super(AST_NODE_TYPE.EXPR);
    this.op = operator;
    this.left = left_operand;
    this.right = right_operand;
  }

  toString() {
    return this.op + '(' + this.left.toString() + ',' + this.right.toString() + ')';
  }

  in(needle, haystack) {
    const to = typeof haystack;

    if( Array.isArray(haystack) || to === 'string' ) {
      return haystack.indexOf(needle) !== -1;
    }

    if( to === 'object' ) {
      return haystack[needle] !== undefined;
    }

    return null;
  }

  execute(scope) {
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
      default:
        return null;
    }
  }
}
