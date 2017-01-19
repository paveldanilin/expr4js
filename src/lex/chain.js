var TokensChain = function(input) {
  var _input = input;
  var _back_token = null;
  var _last_error = null;

  this.getToken = function() {
    if(_input.pos >= _input.buf_len) {
      return null;
    }
    var token = _input.buf[_input.pos];
    _input.pos++;
    return token;
  };

  this.putback = function(token) {
    _input.pos--;
  };

  this.getLastError = function() {
    return _last_error;
  };
};
