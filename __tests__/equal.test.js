const expr4js = require('../dist/expr4.js').default;

const exprParser = new expr4js();

describe("Operator Equal", function() {

  test("1==1", function() {
    const expr = exprParser.parse('1==1');

    const result = expr.execute();

    expect(result).toBe(true);
  });

  test("a==b", function() {
    const expr = exprParser.parse('a==b');
    const scope = {
      a: 100,
      b: 100
    };

    const result = expr.execute(scope);

    expect(result).toBe(true);
  });

  test("100==getNumber()", function() {
    const expr = exprParser.parse('100==getNumber()');
    const scope = {
      getNumber: function() {
        return 100;
      }
    };

    const result = expr.execute(scope);

    expect(result).toBe(true);
  });

  test("55 == fruits.banana", function() {
    const expr = exprParser.parse('55 == fruits.banana');
    const scope = {
      fruits: {
        banana: 55,
        orange: 80
      }
    };

    const result = expr.execute(scope);

    expect(result).toBe(true);
  });

  test("55 == fruits.getBanana()", function() {
    const expr = exprParser.parse('55 == fruits.getBanana()');
    const scope = {
      fruits: {
        getBanana: function() {
          return 55;
        }
      }
    };

    const result = expr.execute(scope);

    expect(result).toBe(true);
  });

  test("'hello' == 'hello'", function() {
    const expr = exprParser.parse("'hello' == 'hello'");

    const result = expr.execute();

    expect(result).toBe(true);
  });

  test('"hello" == "hello"', function() {
    const expr = exprParser.parse('"hello" == "hello"');

    const result = expr.execute();

    expect(result).toBe(true);
  });

  test("'0'==a", function() {
    const expr = exprParser.parse("0==a");

    const scope = {
      a: 0
    };

    const result = expr.execute(scope);

    expect(result).toBe(true);
  });

});
