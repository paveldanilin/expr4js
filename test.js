const expr4js = require('./dist/expr4.js').default;

const exprParser = new expr4js();

const r = exprParser.parse('car.color == "green"');

if (r === null) {
    console.log(exprParser.getLastError().getMessage());
} else {

    const out = r.execute({
        car: {
            color: 'green'
        }
    });

    console.log(out);
}
