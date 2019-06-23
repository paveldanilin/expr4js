import ASTNode from './node';
import AST_NODE_TYPE from './type';

class ASTNodeVariable extends ASTNode
{
  constructor(name)
  {
    super(AST_NODE_TYPE.VARIABLE);
    this.name = name;
  }

  getName()
  {
    return this.name;
  }

  execute(scope)
  {
    return scope[this.name] !== undefined ? scope[this.name] : null;
  }
}

export default ASTNodeVariable;
