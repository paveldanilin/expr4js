
var jsexpr = require('../build/jsexpr.js');

var user_expr = "!flag()";
var expr = jsexpr.parse(user_expr);

if(expr) {
  console.log(expr.execute({
    flag: function() {
      return false;
    },
    auth: false
  }));
}else {
  var err = jsexpr.getLastError();
  console.log("Error<" + err.getCode() + ">: " + err.getMessage() + " at token=[" + err.getToken() + "]");
}
