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
  './src/lex/lex.js'
];

for(var i = 0 ; i < path.length; i++) {
  var code = fs.readFileSync(path[i]);
  vm.runInThisContext(code);
}

describe("Lex#identifer", function() {
  it("'a' is identifer", function() {
    var lex = new Lex("a");
    assert.equal(lex.getToken().getType() === TOKEN_TYPE.IDENTIFER, true);
  });

  it("'person' is identifer", function() {
    var lex = new Lex("person");
    assert.equal(lex.getToken().isIdentifer(), true);
  });
});

describe("Lex#const", function() {

  describe("number", function() {
    it("'1' is const", function() {
      var lex = new Lex("1");
      assert.equal(lex.getToken().getType() === TOKEN_TYPE.CONST, true);
    });

    it("'0.5' is float const", function() {
      var lex = new Lex("0.5");
      assert.equal(lex.getToken().isConst(), true);
    });
  });

  describe("string", function() {
    it("'Hello, World!' is string const (single quote)", function() {
      var lex = new Lex("'Hello, World!'");
      assert.equal(lex.getToken().getType() === TOKEN_TYPE.CONST, true);
    });

    it("\"Hello, World!\" is string const (double quote)", function() {
      var lex = new Lex("\"Hello, World!\"");
      assert.equal(lex.getToken().isConst(), true);
    });

    it("String parse error: sign of close quote is missed (single quote)", function() {
      var lex = new Lex("'string const");
      var token = lex.getToken();
      var last_error = lex.getLastError().getMessage();
      assert.equal(token, null);
    });
  });

});

describe("Lex#operator", function() {
  it("'==' is operator", function() {
    var lex = new Lex("==");
    assert.equal(lex.getToken().getType() === TOKEN_TYPE.OPERATOR, true);
  });
  it("'>' is operator", function() {
    var lex = new Lex(">");
    assert.equal(lex.getToken().getType() === TOKEN_TYPE.OPERATOR, true);
  });
  it("'%' precedence is 7", function() {
    var lex = new Lex("%");
    assert.equal(lex.getToken().getPrecedence(), 7);
  });
});

describe("Lex#keyword", function() {
  it("'in' is keyword", function() {
    var lex = new Lex("in");
    assert.equal(lex.getToken().getType() === TOKEN_TYPE.KEYWORD, true);
  });
});

describe("Lex#putback", function() {
  it("putback token", function() {
    var lex = new Lex("1+1");
    // 1
    var tok = lex.getToken();
    assert.equal(tok.isConst(), true);
    // +
    tok = lex.getToken();
    assert.equal(tok.isOperator(), true);
    lex.putback(tok);
    // +
    tok = lex.getToken();
    assert.equal(tok.isOperator(), true);
    // 1
    tok = lex.getToken();
    assert.equal(tok.isConst(), true);
  });

  it("putback non token", function() {
    var lex = new Lex("1+1");
    var tok = lex.getToken();
    assert.equal(lex.putback("1"), false);
  });
});
