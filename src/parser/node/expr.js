/**
 * @param {[type]} operator      [description]
 * @param {[type]} left_operand  [description]
 * @param {[type]} right_operand [description]
 */
var ASTNodeExpr = function(operator, left_operand, right_operand) {
  ASTNode.call(this, ASTNODE.EXPR);
  this.op = operator;
  this.left = left_operand;
  this.right = right_operand;
};
_extends(ASTNodeExpr, ASTNode);

ASTNodeExpr.prototype.toString = function() {
  return this.op + '(' + this.left.toString() + ',' + this.right.toString() + ')';
};

ASTNodeExpr.prototype.execute = function(scope) {
  switch(this.op) {
    case OPERATOR.SUM: return this.left.execute(scope) + this.right.execute(scope);
    case OPERATOR.DIF: return this.left.execute(scope) - this.right.execute(scope);
    case OPERATOR.MUL: return this.left.execute(scope) * this.right.execute(scope);
    case OPERATOR.DIV: return this.left.execute(scope) / this.right.execute(scope);
    case OPERATOR.GT: return this.left.execute(scope) > this.right.execute(scope);
    case OPERATOR.LT: return this.left.execute(scope) < this.right.execute(scope);
    case OPERATOR.EQ: return this.left.execute(scope) == this.right.execute(scope);
    case OPERATOR.GET: return this.left.execute(scope) >= this.right.execute(scope);
    case OPERATOR.LET: return this.left.execute(scope) <= this.right.execute(scope);
    case OPERATOR.AND: return this.left.execute(scope) && this.right.execute(scope);
    case OPERATOR.OR: return this.left.execute(scope) || this.right.execute(scope);
    case OPERATOR.NEQ: return this.left.execute(scope) != this.right.execute(scope);
    case OPERATOR.DOT: return this.right.execute(this.left.execute(scope));
  }
  return null;
};
