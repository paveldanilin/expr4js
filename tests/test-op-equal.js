var assert = require('assert');
var expr4js = require('../build/expr4js.js');



describe("Operator Equal", function() {
  it("1==1", function() {
    var expr = expr4js.parse('1==1');

    if(expr) {
      var result = expr.execute();
      assert.equal(result, true);
    }
  });

  it("a==b", function() {
    var expr = expr4js.parse('a==b');
    var scope = {
      a: 100,
      b: 100
    };

    if(expr) {
      var result = expr.execute(scope);
      assert.equal(result, true);
    }
  });

  it("100==getNumber()", function() {
    var expr = expr4js.parse('100==getNumber()');
    var scope = {
      getNumber: function() {
        return 100;
      }
    };

    if(expr) {
      var result = expr.execute(scope);
      assert.equal(result, true);
    }
  });

  it("55 == fruits.banana", function() {
    var expr = expr4js.parse('55 == fruits.banana');
    var scope = {
      fruits: {
        banana: 55,
        orange: 80
      }
    };

    if(expr) {
      var result = expr.execute(scope);
      assert.equal(result, true);
    }
  });

  it("55 == fruits.getBanana()", function() {
    var expr = expr4js.parse('55 == fruits.getBanana()');
    var scope = {
      fruits: {
        getBanana: function() {
          return 55;
        }
      }
    };

    if(expr) {
      var result = expr.execute(scope);
      assert.equal(result, true);
    }
  });

  it("'hello' == 'hello'", function() {
    var expr = expr4js.parse("'hello' == 'hello'");

    if(expr) {
      var result = expr.execute();
      assert.equal(result, true);
    }
  });

  it("\"hello\" == \"hello\"", function() {
    var expr = expr4js.parse("\"hello\" == \"hello\"");

    if(expr) {
      var result = expr.execute();
      assert.equal(result, true);
    }
  });

  it("'0'==a", function() {
    var expr = expr4js.parse("0==a");

    var scope = {
      a: 0
    };

    if(expr) {
      var result = expr.execute(scope);
      assert.equal(result, true);
    }

  });

});
