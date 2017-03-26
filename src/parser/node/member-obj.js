/**
 * @param {[type]} name [description]
 */
var ASTNodeMemberOfObj = function(obj_name, next)
{
  ASTNode.call(this, AST_NODE_TYPE.MEMBER_OF_OBJ);
  this.obj_name = obj_name;
  this.next = next || null;
};
_extends(ASTNodeMemberOfObj, ASTNode);

ASTNodeMemberOfObj.prototype.getNextValue = function(next, scope) {
  if(next.isMemberOfObj() || next.isVariable() || next.isFunctionCall()) {
    return next.execute(scope);
  }
  // Error
  return null;
};

ASTNodeMemberOfObj.prototype.getObjName = function() {
  return this.obj_name;
};

ASTNodeMemberOfObj.prototype.execute = function(scope) {
  if(scope[this.obj_name] === undefined) {
    return undefined;
  }
  if(this.next !== null) {
    return this.getNextValue(this.next, scope[this.obj_name]);
  }
  return scope[this.obj_name];
};
