/**
 * [TokenIdentifer]
 * @param {string} token [description]
 * @param {number} pos   [description]
 */
var TokenIdentifer = function(token, pos)
{
  Token.call(this, TOKEN_TYPE.IDENTIFER, token, pos);
};
_extends(TokenIdentifer, Token);

/**
 * [clone]
 * @return {[TokenIdentifer} [description]
 */
TokenIdentifer.prototype.clone = function() {
  return new TokenIdentifer(this.toString(), this.getPos());
};
