var TOKEN_TYPE = {
  ERROR:      0,
  IDENTIFER:  1,
  CONST:      2,
  OPERATOR:   3,
  KEYWORDS:   4
};

/**
 * [Token]
 * @param {number} type  [description]
 * @param {string} token [description]
 * @param {number} pos   [description]
 */
var Token = function(type, token, pos)
{
  this.type  = type;
  this.token = token;
  this.pos   = pos;
};

/**
 * [getType]
 * @return {number} [description]
 */
Token.prototype.getType = function() {
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
Token.prototype.isIdentifer = function() {
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

Token.create = function(token_type, values) {
  if(token_type instanceof String) {
    token_type = token_type.toLowerCase();
    switch(token_type) {
      case "identifer":
        token_type = TOKEN_TYPE.IDENTIFER;
      break;
      case "const":
        token_type = TOKEN_TYPE.CONST;
      break;
      case "keyword":
        token_type = TOKEN_TYPE.KEYWORD;
      break;
      case "operator":
        token_type = TOKEN_TYPE.OPERATOR;
      break;
    }
  }
  switch(token_type) {
    case TOKEN_TYPE.IDENTIFER:
      return new TokenIdentifer(values.token, values.pos);
    case TOKEN_TYPE.CONST:
      return new TokenConst(values.token, values.pos, values.data_type);
    case TOKEN_TYPE.KEYWORD:
      return new TokenKeyword(values.token, values.pos, values.code);
    case TOKEN_TYPE.OPERATOR:
      return new TokenOperator(values.token, values.pos, values.op, values.precedence);
  }
  return null;
};
