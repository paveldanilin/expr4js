import AST_NODE_TYPE from './type';

class ASTNode
{
  constructor(type)
  {
    this.type = type;
  }

  getType() {
    return this.type;
  }

  isExpr() {
    return this.type === AST_NODE_TYPE.EXPR;
  }

  isFunctionCall() {
    return this.type === AST_NODE_TYPE.FUNCTION_CALL;
  }

  isConst() {
    return this.type === AST_NODE_TYPE.CONST;
  }

  isVariable() {
    return this.type === AST_NODE_TYPE.VARIABLE;
  }

  isMemberOfObj() {
    return this.type === AST_NODE_TYPE.MEMBER_OF_OBJ;
  }

  execute(scope) {
    return null;
  }
}

export default ASTNode;
