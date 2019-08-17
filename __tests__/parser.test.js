import TOKEN_TYPE from '../src/lex/token/type';
import Lex from '../src/lex/lex';

describe("Parser#const", function() {
  test("100", function() {
    const lex = new Lex("a");

    expect(lex.getToken().getType()).toBe(TOKEN_TYPE.IDENTIFER);
  });
});
