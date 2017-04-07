/**
 * @param {[type]} name [description]
 */
var ASTNodeVariable = function(name)
{
  ASTNode.call(this, AST_NODE_TYPE.VARIABLE);
  this.name = name;
};
_extends(ASTNodeVariable, ASTNode);

ASTNodeVariable.prototype.getName = function() {
  return this.name;
};

ASTNodeVariable.prototype.execute = function(scope) {
  var val = scope[this.name] !== undefined ? scope[this.name] : null;
  return val;
};
