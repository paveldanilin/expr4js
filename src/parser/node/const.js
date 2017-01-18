/**
 * @param {[type]} val  [description]
 * @param {[type]} type [description]
 */
var ASTNodeConst = function(val, type) {
  ASTNode.call(this, ASTNODE.CONST);
  this.val = val;
  this.type = type;
};
_extends(ASTNodeConst, ASTNode);

ASTNodeConst.prototype.getDataType = function() {
  return this.type;
};

ASTNodeConst.prototype.execute = function(scope) {
  return this.val;
};
