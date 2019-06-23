import Expr4JS from '../dist/expr4js.bundle';

describe("Operator Equal", function() {

  it("1==1", function() {
    const expr = Expr4JS.parse('1==1');

    if(expr) {
      const result = expr.execute();

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("a==b", function() {
    const expr = Expr4JS.parse('a==b');
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
    const expr = Expr4JS.parse('100==getNumber()');
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
    const expr = Expr4JS.parse('55 == fruits.banana');
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
    const expr = Expr4JS.parse('55 == fruits.getBanana()');
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
    const expr = Expr4JS.parse("'hello' == 'hello'");

    if(expr) {
      const result = expr.execute();

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("\"hello\" == \"hello\"", function() {
    const expr = Expr4JS.parse("\"hello\" == \"hello\"");

    if(expr) {
      const result = expr.execute();

      expect(result).toBe(true);
      // assert.equal(result, true);
    }
  });

  it("'0'==a", function() {
    const expr = Expr4JS.parse("0==a");

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
