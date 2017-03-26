var PARSER_ERROR = {
  UNEXPECTED_TOKEN: {
    MSG: 'Unexpected token',
    CODE: 2000
  },
  UNEXPECTED_TOKEN_SEQ: {
    MSG: 'Unexpected end of tokens sequence',
    CODE: 2001
  },
  UNABLE_PARSE_EXPR: {
    MSG: 'Unable to parse expression',
    CODE: 2002
  }
};

/**
 * [ParserError]
 * @param {number} code
 * @param {string} msg
 * @param {object} token
 */
var ParserError = function(code, msg, token)
{
  var _code  = code;
  var _msg   = msg;
  var _token = token;

  /**
   * [getToken]
   * @return {object} [description]
   */
  this.getToken = function() {
    return _token;
  };

  /**
   * [getCode]
   * @return {number} [description]
   */
  this.getCode = function() {
    return _code;
  };

  /**
   * [getMessage]
   * @return {string}
   */
  this.getMessage = function() {
    return _msg;
  };

};

ParserError.create = function(code, msg, token) {
  return new ParserError(code, msg, token);
};

ParserError.UnexpectedToken = function(token) {
  return ParserError.create(PARSER_ERROR.UNEXPECTED_TOKEN.CODE, PARSER_ERROR.UNEXPECTED_TOKEN.MSG, token);
};

ParserError.UnexpectedTokenSeq = function() {
  return ParserError.create(PARSER_ERROR.UNEXPECTED_TOKEN_SEQ.CODE, PARSER_ERROR.UNEXPECTED_TOKEN_SEQ.MSG, null);
};

ParserError.UnableParseExpr = function() {
  return ParserError.create(PARSER_ERROR.UNABLE_PARSE_EXPR.CODE, PARSER_ERROR.UNABLE_PARSE_EXPR.MSG, null);
};
