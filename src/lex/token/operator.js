/**
 * [TokenOperator]
 * @param {string} token      [description]
 * @param {number} pos        [description]
 * @param {number} op         [description]
 * @param {number} precedence [description]
 */
var TokenOperator = function(token, pos, op, precedence) {
  Token.call(this, TOKEN_TYPE.OPERATOR, token, pos);
  this.op    = op;
  this.precedence = precedence;
};
_extends(TokenOperator, Token);

/**
 * [getOperator]
 * @return {number} [description]
 */
TokenOperator.prototype.getOperator =function() {
  return this.op;
};

/**
 * [getPrecedence]
 * @return {number} [description]
 */
TokenOperator.prototype.getPrecedence = function() {
  return this.precedence;
};

/**
 * [is]
 * @param  {number}  op_code [description]
 * @return {Boolean}         [description]
 */
TokenOperator.prototype.is = function(op_code) {
  return this.op === op_code;
};

TokenOperator.prototype.isUnary = function() {
  switch(this.op) {
    case OPERATOR.NOT: return true;
  }
  return false;
};

/**
 * [clone]
 * @return {TokenOperator} [description]
 */
TokenOperator.prototype.clone = function() {
  return new TokenOperator(this.toString(), this.getPos(), this.getOperator(), this.getPrecedence());
};
