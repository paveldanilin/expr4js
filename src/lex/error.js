var LexError = function(token, pos, code, def) {
  var _token = token;
  var _pos   = pos;
  var _code  = code;
  var _def   = def;

  this.getToken = function() {
    return _token;
  };
  
  this.getPos = function() {
    return _pos;
  };

  this.getCode = function() {
    return _code;
  };

  this.getDef = function() {
    return _def;
  };

};
