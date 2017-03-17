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
