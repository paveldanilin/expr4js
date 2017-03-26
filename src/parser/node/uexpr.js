/**
 * @param {[type]} operator
 * @param {[type]} operand
 */
var ASTNodeUnaryExpr = function(operator, operand) {
  ASTNode.call(this, AST_NODE_TYPE.UNARY_EXPR);
  this.op = operator;
  this.operand = operand;
};
_extends(ASTNodeUnaryExpr, ASTNode);

ASTNodeUnaryExpr.prototype.toString = function() {
  return this.op + '(' + this.operand.toString() + ')';
};

ASTNodeUnaryExpr.prototype.execute = function(scope) {
  switch(this.op) {
    case OPERATOR.NOT: return !this.operand.execute(scope);
  }
  return null;
};
