/**
 * Token const
 * @param {[type]} token [description]
 * @param {[type]} pos   [description]
 * @param {[type]} op  [description]
 */
var TokenConst = function(token, pos, dtype) {
  Token.call(this, TTOKEN.CONST, token, pos);
  this.dtype = dtype;
};
_extends(TokenConst, Token);

TokenConst.prototype.getDataType = function() {
  return this.dtype;
};

TokenConst.prototype.clone = function() {
  return new TokenConst(this.toString(), this.getPos(), this.getDataType());
};
