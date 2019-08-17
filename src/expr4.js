import Lex from './lex/lex';
import Parser from './parser/parser';

export default class expr4js {
  constructor() {
    this.lastError = null;
  }

  doParse(input) {
    const lex = new Lex(input);
    const parser = new Parser();

    if(! parser.parse(lex)) {
      const lexError = lex.getLastError();

      if(lexError !== null) {
        this.lastError = lexError;
        return null;
      }

      const parserError = parser.getLastError();

      if(parserError !== null) {
        this.lastError = parserError;
        return null;
      }
    }

    return parser.getAST();
  }

  parse(expr) {
    return this.doParse({
      buf:     expr,
      bufLen: expr.length,
      pos:     0
    });
  }

  getLastError() {
    return this.lastError;
  }
}
