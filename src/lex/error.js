var LEX_ERROR = {
  PARSE_STRING     : {
    CODE: 1000,
    MSG: 'Unable to parse string'
  },
  UNKNOWN_OPERATOR : {
    CODE: 1001,
    MSG: 'Unknown operator'
  },
  BAD_NUMBER       : {
    CODE: 1002,
    MSG: 'Bad number format'
  },
  BAD_IDENTIFER    : {
    CODE: 1003,
    MSG: 'Bad identifer, identifer allowed cahrs [_a-zA-Z]'
  },
  UNABLE_TO_PUTBACK_NON_TOKEN: {
    CODE: 1004,
    MSG: 'Unable to putback non token object'
  }
};

/**
 * [LexError]
 * @param {number} code
 * @param {string} msg
 * @param {number} pos
 * @param {string} token
 */
var LexError = function(code, msg, pos, token)
{
  var _code  = code !== undefined ? code : null;
  var _msg   = msg !== undefined ? msg : null;
  var _pos   = pos !== undefined ? pos : null;
  var _token = token !== undefined ? token : null;

  /**
   * [getToken]
   * @return {string} [description]
   */
  this.getToken = function() {
    return _token;
  };

  /**
   * [getPos]
   * @return {number} [description]
   */
  this.getPos = function() {
    return _pos;
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

LexError.create = function(code, msg, pos, token) {
  return new LexError(code, msg, pos, token);
};

LexError.UnableToParseString = function(pos) {
  return LexError.create(LEX_ERROR.PARSE_STRING.CODE, LEX_ERROR.PARSE_STRING.MSG, pos);
};

LexError.UnknownOperator = function(pos, token) {
  return LexError.create(LEX_ERROR.UNKNOWN_OPERATOR.CODE, LEX_ERROR.UNKNOWN_OPERATOR.MSG, pos, token);
};

LexError.BadNumber = function(pos, token) {
  return LexError.create(LEX_ERROR.BAD_NUMBER.CODE, LEX_ERROR.BAD_NUMBER.MSG, pos, token);
};

LexError.BadIdentifer = function(pos, token) {
  return LexError.create(LEX_ERROR.BAD_IDENTIFER.CODE, LEX_ERROR.BAD_IDENTIFER.MSG, pos, token);
};

LexError.UnableToPutbackToken = function(pos, token) {
  return LexError.create(LEX_ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.CODE, LEX_ERROR.UNABLE_TO_PUTBACK_NON_TOKEN.MSG, pos, token);
};
