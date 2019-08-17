import TokenConst from './token/const';
import TokenIdentifer from './token/identifer';
import TokenKeyword from './token/keyword';
import TokenOperator from './token/operator';
import TOKEN_TYPE from './token/type';

export default function tokenFactory(tokenType, values) {
    const tokenTypeStr = tokenTypeToString(tokenType);

    switch(tokenTypeStr) {
        case 'identifer':
            return new TokenIdentifer(values.token, values.pos);
        case 'const':
            return new TokenConst(values.token, values.pos, values.dataType);
        case 'keyword':
            return new TokenKeyword(values.token, values.pos, values.code);
        case 'operator':
            return new TokenOperator(values.token, values.pos, values.op, values.precedence);

        default:
            throw new Error(`Unknown token type "${tokenType}"`);
    }
}

function tokenTypeToString(code) {
    const datatype = typeof code;

    if (datatype === 'string') {
        return code.toLowerCase();
    }

    if (datatype !== 'number') {
        throw new Error(`Expected number, but got ${datatype}`);
    }

    switch(code) {
        case TOKEN_TYPE.IDENTIFER:
            return 'identifer';

        case TOKEN_TYPE.CONST:
            return 'const';

        case TOKEN_TYPE.KEYWORDS:
            return 'keyword';

        case TOKEN_TYPE.OPERATOR:
            return 'operator';

        default:
            throw new Error(`Unknown token code "${code}"`);
    }
}
