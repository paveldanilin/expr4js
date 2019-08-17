import ASTNode from './node';
import AST_NODE_TYPE from './type';

export default class ASTNodeVariable extends ASTNode {
  constructor(name) {
    super(AST_NODE_TYPE.VARIABLE);
    this.name = name;
  }

  getName() {
    return this.name;
  }

  execute(scope) {
    return scope[this.name];
  }
}
