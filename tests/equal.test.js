const expr4js = require('../dist/expr4.js').default;

const exprParser = new expr4js();

describe("Operator Equal", function() {

  it("1==1", function() {
    const expr = exprParser.parse('1==1');

    if(expr) {
      const result = expr.execute();

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("a==b", function() {
    const expr = exprParser.parse('a==b');
    const scope = {
      a: 100,
      b: 100
    };

    if(expr) {
      const result = expr.execute(scope);

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("100==getNumber()", function() {
    const expr = exprParser.parse('100==getNumber()');
    const scope = {
      getNumber: function() {
        return 100;
      }
    };

    if(expr) {
      const result = expr.execute(scope);

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("55 == fruits.banana", function() {
    const expr = exprParser.parse('55 == fruits.banana');
    const scope = {
      fruits: {
        banana: 55,
        orange: 80
      }
    };

    if(expr) {
      const result = expr.execute(scope);

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("55 == fruits.getBanana()", function() {
    const expr = exprParser.parse('55 == fruits.getBanana()');
    const scope = {
      fruits: {
        getBanana: function() {
          return 55;
        }
      }
    };

    if(expr) {
      const result = expr.execute(scope);

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("'hello' == 'hello'", function() {
    const expr = exprParser.parse("'hello' == 'hello'");

    if(expr) {
      const result = expr.execute();

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("\"hello\" == \"hello\"", function() {
    const expr = exprParser.parse("\"hello\" == \"hello\"");

    if(expr) {
      const result = expr.execute();

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("'0'==a", function() {
    const expr = exprParser.parse("0==a");

    const scope = {
      a: 0
    };

    if(expr) {
      const result = expr.execute(scope);

      expect(result).toBe(true);
      // assert.equal(result, true);
    }

  });

});
