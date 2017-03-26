var AST_NODE_TYPE = {
  EXPR:           0,
  UNARY_EXPR:     1,
  FUNCTION_CALL:  2,
  CONST:          3,
  VARIABLE:       4,
  MEMBER_OF_OBJ:  5
};

/**
 * @param {[type]} type [description]
 */
var ASTNode = function(type)
{
  this.type = type;
};

ASTNode.prototype.getType = function() {
  return this.type;
};
ASTNode.prototype.isExpr = function() {
  return this.type === AST_NODE_TYPE.EXPR;
};
ASTNode.prototype.isFunctionCall = function() {
  return this.type === AST_NODE_TYPE.FUNCTION_CALL;
};
ASTNode.prototype.isConst = function() {
  return this.type === AST_NODE_TYPE.CONST;
};
ASTNode.prototype.isVariable = function() {
  return this.type === AST_NODE_TYPE.VARIABLE;
};
ASTNode.prototype.isMemberOfObj = function() {
  return this.type === AST_NODE_TYPE.MEMBER_OF_OBJ;
};
ASTNode.prototype.execute = function(scope) {
  return null;
};
