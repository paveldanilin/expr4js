import ASTNode from './node';
import AST_NODE_TYPE from './type';

export default class ASTNodeMemberOfObj extends ASTNode {
  constructor(objName, next) {
    super(AST_NODE_TYPE.MEMBER_OF_OBJ);
    this.objName = objName;
    this.next = next || null;
  }

  getNextValue(next, scope) {
    if(next.isMemberOfObj() || next.isVariable() || next.isFunctionCall()) {
      return next.execute(scope);
    }
    // Error
    return null;
  }

  getObjName() {
    return this.objName;
  }

  execute(scope) {
    if( scope[this.objName] === undefined ) {
      return undefined;
    }

    if( this.next !== null ) {
      return this.getNextValue(this.next, scope[this.objName]);
    }

    return scope[this.objName];
  }
}
