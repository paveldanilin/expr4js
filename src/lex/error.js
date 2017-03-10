/**
 * [LexError]
 * @param {number} code
 * @param {string} msg
 * @param {number} pos
 * @param {string} token
 */
var LexError = function(code, msg, pos, token) {

  var _code  = code;
  var _msg   = msg;
  var _pos   = pos;
  var _token = token;

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
