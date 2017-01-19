var ASTNODE = {
  EXPR:           0,
  FUNCTION_CALL:  1,
  CONST:          2,
  VARIABLE:       3,
  MEMBER_OF_OBJ:  4
};

/**
 * @param {[type]} type [description]
 */
var ASTNode = function(type) {
  this.type = type;
};
ASTNode.prototype.getType = function() {
  return this.type;
};
ASTNode.prototype.isExpr = function() {
  return this.type === ASTNODE.EXPR;
};
ASTNode.prototype.isFunctionCall = function() {
  return this.type === ASTNODE.FUNCTION_CALL;
};
ASTNode.prototype.isConst = function() {
  return this.type === ASTNODE.CONST;
};
ASTNode.prototype.isVariable = function() {
  return this.type === ASTNODE.VARIABLE;
};
ASTNode.prototype.isMemberOfObj = function() {
  return this.type === ASTNODE.MEMBER_OF_OBJ;
};
ASTNode.prototype.execute = function(scope) {
  return null;
};
