import Lex from './lex/lex';
import Parser from './parser/parser';

class expr4js
{
  constructor() {
    this.lastError = null;
  }

  doParse(input)
  {
    const lex    = new Lex(input);
    const parser = new Parser();

    if(! parser.parse(lex)) {

      const lerr = lex.getLastError();

      if(lerr !== null) {
        this.lastError = lerr;
        return null;
      }

      const perr = parser.getLastError();

      if(perr !== null) {
        this.lastError = perr;
        return null;
      }
    }

    return parser.getAST();
  }

  parse(expr)
  {
    const input = {
      buf:     expr,
      buf_len: expr.length,
      pos:     0
    };

    return this.doParse(input);
  }

  getLastError()
  {
    return this.lastError;
  }
}

export default expr4js;
