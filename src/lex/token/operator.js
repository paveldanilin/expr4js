/**
 * Token operator
 * @param {[type]} token [description]
 * @param {[type]} pos   [description]
 * @param {[type]} op  [description]
 */
var TokenOperator = function(token, pos, op) {
  Token.call(this, TTOKEN.OPERATOR, token, pos);
  this.op    = op;
};
_extends(TokenOperator, Token);

TokenOperator.prototype.getOperator = function() {
  return this.op;
};

TokenOperator.prototype.getPrecedence = function() {
  return _precedence[this.token] !== undefined ? _precedence[this.token] : null;
};

TokenOperator.prototype.is = function(op_code) {
  return this.op === op_code;
};

TokenOperator.prototype.clone = function() {
  return new TokenOperator(this.toString(), this.getPos(), this.getOperator());
};
