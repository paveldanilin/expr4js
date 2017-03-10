/**
 * [TokenKeyword]
 * @param {string} token [description]
 * @param {number} pos   [description]
 * @param {number} code  [description]
 */
var TokenKeyword = function(token, pos, code) {
  Token.call(this, TOKEN_TYPE.KEYWORD, token, pos);
  this.code  = code;
};
_extends(TokenKeyword, Token);

/**
 * [getCode]
 * @return {number} [description]
 */
TokenKeyword.prototype.getCode = function() {
  return this.code;
};

/**
 * [clone]
 * @return {TokenKeyword} [description]
 */
TokenKeyword.prototype.clone = function() {
  return new TokenKeyword(this.toString(), this.getPos(), this.getCode());
};
