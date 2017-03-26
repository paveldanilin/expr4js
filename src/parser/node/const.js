/**
 * @param {[type]} val  [description]
 * @param {[type]} type [description]
 */
var ASTNodeConst = function(val, type)
{
  ASTNode.call(this, AST_NODE_TYPE.CONST);
  this.val = val;
  this.type = type;
};
_extends(ASTNodeConst, ASTNode);

ASTNodeConst.prototype.getDataType = function() {
  return this.type;
};

ASTNodeConst.prototype.execute = function(scope) {
  if(this.type === CONST.NUMBER) {
    return +this.val;
  }
  return this.val;
};
