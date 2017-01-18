/**
 * Token keyword
 * @param {[type]} token [description]
 * @param {[type]} pos   [description]
 * @param {[type]} op  [description]
 */
var TokenKeyword = function(token, pos, code) {
  Token.call(this, TTOKEN.KEYWORD, token, pos);
  this.code  = code;
};
_extends(TokenKeyword, Token);

TokenKeyword.prototype.getCode = function() {
  return this.code;
};

TokenKeyword.prototype.clone = function() {
  return new TokenKeyword(this.toString(), this.getPos(), this.getCode());
};
