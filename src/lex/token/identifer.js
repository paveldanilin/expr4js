/**
 * Token identifer
 * @param {[type]} token [description]
 * @param {[type]} pos   [description]
 * @param {[type]} op  [description]
 */
var TokenIdentifer = function(token, pos) {
  Token.call(this, TTOKEN.IDENTIFER, token, pos);
};
_extends(TokenIdentifer, Token);

TokenIdentifer.prototype.clone = function() {
  return new TokenIdentifer(this.toString(), this.getPos());
};
