import TOKEN_TYPE from '../src/lex/token/type';
import LEX_ERROR from '../src/lex/errorcodes';
import Lex from '../src/lex/lex';

describe("Lex#identifer", function() {

  it("'a' is identifer", function() {
    const lex = new Lex("a");

    expect(lex.getToken().getType()).toBe(TOKEN_TYPE.IDENTIFER);

  });

  it("'person' is identifer", function() {
    const lex = new Lex("person");

    expect(lex.getToken().isIdentifer()).toBe(true);
  });

});

describe("Lex#const", function() {

  describe("number", function() {

    it("'1' is const", function() {
      const lex = new Lex("1");

      expect(lex.getToken().getType()).toBe(TOKEN_TYPE.CONST);
    });

    it("'0.5' is float const", function() {
      const lex = new Lex("0.5");

      expect(lex.getToken().isConst()).toBe(true);
    });

  });

  describe("string", function() {

    it("'Hello, World!' is string const (single quote)", function() {
      const lex = new Lex("'Hello, World!'");

      expect(lex.getToken().getType()).toBe(TOKEN_TYPE.CONST);
    });

    it("\"Hello, World!\" is string const (double quote)", function() {
      const s = '"Hello, World-2!"';
      const lex = new Lex(s);

      expect(lex.getToken().isConst()).toBe(true);
    });

    it("String parse error: sign of close quote is missed (single quote)", function() {
      const lex = new Lex("'string const");
      const token = lex.getToken();
      const last_error = lex.getLastError().getMessage();

      expect(token).toBe(null);
    });
  });

});

describe("Lex#operator", function() {

  it("'==' is operator", function() {
    const lex = new Lex("==");

    expect(lex.getToken().getType()).toBe(TOKEN_TYPE.OPERATOR);
  });

  it("'>' is operator", function() {
    const lex = new Lex(">");

    expect(lex.getToken().getType()).toBe(TOKEN_TYPE.OPERATOR);
  });

  it("'%' precedence is 7", function() {
    const lex = new Lex("%");

    expect(lex.getToken().getPrecedence()).toBe(7);
  });
});

describe("Lex#keyword", function() {
  it("'in' is keyword", function() {
    const lex = new Lex("in");

    expect(lex.getToken().getType()).toBe(TOKEN_TYPE.KEYWORDS);
  });
});

describe("Lex#putback", function() {
  it("putback token", function() {

    const lex = new Lex("1+1");

    // 1
    let tok = lex.getToken();
    expect(tok.isConst()).toBe(true);


    // +
    tok = lex.getToken();
    expect(tok.isOperator()).toBe(true);
    //assert.equal(tok.isOperator(), true);
    lex.putback(tok);


    // +
    tok = lex.getToken();
    expect(tok.isOperator()).toBe(true);
    //assert.equal(tok.isOperator(), true);


    // 1
    tok = lex.getToken();
    //assert.equal(tok.isConst(), true);
    expect(tok.isConst()).toBe(true);

  });

  it("putback non token", function() {
    const lex = new Lex("1+1");
    const tok = lex.getToken();

    expect(lex.putback("1")).toBe(false);
    //assert.equal(lex.putback("1"), false);
  });
});

describe("Lex#error", function() {

  it("PARSE_STRING='my string", function() {
    const lex = new Lex("'my string");
    lex.getToken(); // Trying to get = 'my string

    expect(lex.getLastError().getCode()).toBe(LEX_ERROR.PARSE_STRING.CODE);
    //assert.equal(lex.getLastError().getCode(), LEX_ERROR.PARSE_STRING.CODE);
  });

  it("BAD_NUMBER=67ii8", function() {
    const lex = new Lex("67ii8");
    lex.getToken(); // Trying to get number

    expect(lex.getLastError().getCode()).toBe(LEX_ERROR.BAD_NUMBER.CODE);
    // assert.equal(lex.getLastError().getCode(), LEX_ERROR.BAD_NUMBER.CODE);
  });

  it("BAD_NUMBER=-o67ii8", function() {
    const lex = new Lex("-67ii8");
    lex.getToken(); // Trying to get number

    expect(lex.getLastError().getCode()).toBe(LEX_ERROR.BAD_NUMBER.CODE);
    //assert.equal(lex.getLastError().getCode(), LEX_ERROR.BAD_NUMBER.CODE);
  });

  it("BAD_IDENTIFER=&gh", function() {
    const lex = new Lex("&gh");
    lex.getToken(); // Trying to get number

    expect(lex.getLastError().getCode()).toBe(LEX_ERROR.BAD_IDENTIFER.CODE);
    //assert.equal(lex.getLastError().getCode(), LEX_ERROR.BAD_IDENTIFER.CODE);
  });

});
