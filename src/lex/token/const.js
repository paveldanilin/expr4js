/**
 * [TokenConst]
 * @param {string} token [description]
 * @param {number} pos   [description]
 * @param {number} dtype Value of CONST global object
 */
var TokenConst = function(token, pos, dtype) {
  Token.call(this, TOKEN_TYPE.CONST, token, pos);
  this.dtype = dtype;
};
_extends(TokenConst, Token);

/**
 * [getDataType]
 * @return {number} [description]
 */
TokenConst.prototype.getDataType = function() {
  return this.dtype;
};

/**
 * [clone]
 * @return {TokenConst} [description]
 */
TokenConst.prototype.clone = function() {
  return new TokenConst(this.toString(), this.getPos(), this.getDataType());
};
