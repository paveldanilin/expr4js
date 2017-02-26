/**
 * [Token]
 * @param {number} type  [description]
 * @param {string} token [description]
 * @param {number} pos   [description]
 */
var Token = function(type, token, pos) {
  this.type  = type;
  this.token = token;
  this.pos   = pos;
};

/**
 * [getType]
 * @return {number} [description]
 */
Token.prototype.getType= function() {
  return this.type;
};

/**
 * [toString]
 * @return {string} [description]
 */
Token.prototype.toString = function() {
  return this.token;
};

/**
 * [getPos]
 * @return {number} [description]
 */
Token.prototype.getPos = function() {
  return this.pos;
};

/**
 * [isError]
 * @return {Boolean} [description]
 */
Token.prototype.isError = function() {
  return this.type === TOKEN_TYPE.ERROR;
};

/**
 * [isIdentifer]
 * @return {Boolean} [description]
 */
Token.prototype.isIdentifer= function() {
  return this.type === TOKEN_TYPE.IDENTIFER;
};

/**
 * [isConst]
 * @return {Boolean} [description]
 */
Token.prototype.isConst = function() {
  return this.type === TOKEN_TYPE.CONST;
};

/**
 * [isOperator]
 * @return {Boolean} [description]
 */
Token.prototype.isOperator = function() {
  return this.type === TOKEN_TYPE.OPERATOR;
};

/**
 * [isKeyword]
 * @return {Boolean} [description]
 */
Token.prototype.isKeyword = function() {
  return this.type === TOKEN_TYPE.KEYWORD;
};

/**
 * [clone]
 * @return {Token} [description]
 */
Token.prototype.clone = function() {
  return new Token(this.type, this.token, this.pos);
};
