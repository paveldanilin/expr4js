const expr4js = require('../dist/expr4.js').default;

const exprParser = new expr4js();

const model = {
    car: {
        color: 'green'
    }
};

const expr = 'car.color == "green"';

const r = exprParser.parse(expr);

if (r === null) {
    console.log(exprParser.getLastError().getMessage());
} else {
    console.log(`<${expr}>: ` + r.execute(model));
}
