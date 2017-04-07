/**
 * @param {[type]} val  [description]
 * @param {[type]} type [description]
 */
var ASTNodeConst = function(val, type)
{
  ASTNode.call(this, AST_NODE_TYPE.CONST);
  this.val = val;
  this.dtype = type;

  if(type === DATA_TYPE.NUMBER) {
    this.val = +this.val;
  }
};
_extends(ASTNodeConst, ASTNode);

ASTNodeConst.prototype.getDataType = function() {
  return this.dtype;
};

ASTNodeConst.prototype.execute = function(scope) {
  /*if(this.type === DATA_TYPE.NUMBER) {
    return +this.val;
  }*/
  return this.val;
};
