import ASTNode from './node';
import AST_NODE_TYPE from './type';

export default class ASTNodeMemberOfObj extends ASTNode {
  constructor(obj_name, next) {
    super(AST_NODE_TYPE.MEMBER_OF_OBJ);
    this.obj_name = obj_name;
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
    return this.obj_name;
  }

  execute(scope) {
    if( scope[this.obj_name] === undefined ) {
      return undefined;
    }

    if( this.next !== null ) {
      return this.getNextValue(this.next, scope[this.obj_name]);
    }

    return scope[this.obj_name];
  }
}
