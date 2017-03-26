var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var path = [
  './src/common.js',
  './src/lex/error.js',
  './src/lex/token/token.js',
  './src/lex/token/const.js',
  './src/lex/token/identifer.js',
  './src/lex/token/keyword.js',
  './src/lex/token/operator.js',
  './src/lex/lex.js',
  './src/parser/error.js',
  './src/parser/node/node.js',
  './src/parser/node/const.js',
  './src/parser/node/expr.js',
  './src/parser/node/func.js',
  './src/parser/node/member-obj.js',
  './src/parser/node/uexpr.js',
  './src/parser/node/variable.js'
];

for(var i = 0 ; i < path.length; i++) {
  var code = fs.readFileSync(path[i]);
  vm.runInThisContext(code);
}

//----------------------------------------------------------------------------------------------------------------------

describe("Parser#const", function() {
  it("100", function() {
    var lex = new Lex("a");
    assert.equal(lex.getToken().getType() === TOKEN_TYPE.IDENTIFER, true);
  });
});
