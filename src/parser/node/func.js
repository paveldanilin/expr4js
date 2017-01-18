/**
 * @param {[type]} name [description]
 * @param {[type]} args [description]
 */
var ASTNodeFunc = function(name, args) {
  ASTNode.call(this, ASTNODE.FUNCTION_CALL);
  this.name = name;
  this.args = args;
};
_extends(ASTNodeFunc, ASTNode);

ASTNodeFunc.prototype.execute = function(scope) {
  console.log(this.args)
  return null;
};
