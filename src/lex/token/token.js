/**
 * Base token
 * @param {[type]} token [description]
 * @param {[type]} pos   [description]
 */
var Token = function(type, token, pos) {
  this.type  = type;
  this.token = token;
  this.pos   = pos;
};
Token.prototype = {
  getType: function() {
    return this.type;
  },

  toString: function() {
    return this.token;
  },

  getPos: function() {
    return this.pos;
  },

  isError: function() {
    return this.type === TTOKEN.ERROR;
  },

  isIdentifer: function() {
    return this.type === TTOKEN.IDENTIFER;
  },

  isConst: function() {
    return this.type === TTOKEN.CONST;
  },

  isOperator: function() {
    return this.type === TTOKEN.OPERATOR;
  },

  isKeyword: function() {
    return this.type === TTOKEN.KEYWORD;
  },

  clone: function() {
    return new Token(this.type, this.token, this.pos);
  }
};
