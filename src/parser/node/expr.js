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
  var vleft   = this.left.execute(scope);
  var vright  = this.right.execute(scope);
  switch(this.op) {
    case OPERATOR.SUM: return vleft + vright;
    case OPERATOR.DIF: return vleft - vright;
    case OPERATOR.MUL: return vleft * vright;
    case OPERATOR.DIV: return vleft / vright;
    case OPERATOR.GT: return vleft > vright;
    case OPERATOR.LT: return vleft < vright;
    case OPERATOR.EQ: return vleft == vright;
    case OPERATOR.GET: return vleft >= vright;
    case OPERATOR.LET: return vleft <= vright;
    case OPERATOR.AND: return vleft && vright;
    case OPERATOR.OR: return vleft || vright;
    case OPERATOR.NEQ: return vleft != vright;
  }
  return null;
};
