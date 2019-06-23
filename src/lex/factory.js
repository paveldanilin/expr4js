import TokenConst from './token/const';
import TokenIdentifer from './token/identifer';
import TokenKeyword from './token/keyword';
import TokenOperator from './token/operator';
import TOKEN_TYPE from './token/type';


function tokenFactory(token_type, values)
{
    if(typeof token_type == 'string') {

        token_type = token_type.toLowerCase();

        switch(token_type) {
            case "identifer":
                return new TokenIdentifer(values.token, values.pos);
            case "const":
                return new TokenConst(values.token, values.pos, values.data_type);
            case "keyword":
                return new TokenKeyword(values.token, values.pos, values.code);
            case "operator":
                return new TokenOperator(values.token, values.pos, values.op, values.precedence);
        }
    }

    switch(token_type) {
        case TOKEN_TYPE.IDENTIFER:
            return new TokenIdentifer(values.token, values.pos);
        case TOKEN_TYPE.CONST:
            return new TokenConst(values.token, values.pos, values.data_type);
        case TOKEN_TYPE.KEYWORDS:
            return new TokenKeyword(values.token, values.pos, values.code);
        case TOKEN_TYPE.OPERATOR:
            return new TokenOperator(values.token, values.pos, values.op, values.precedence);
    }

    return null;
}


export default tokenFactory;
