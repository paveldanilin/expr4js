const lib = require('./dist/expr4.js').default;

const a = new lib();
/*
const expression = a.parse('1==1');

if ( expression === null ) {
    console.log(a.getLastError().getMessage());
} else {
    console.log(expression.execute());
}
*/

const f = a.parse('car.color == "red"');

if (f === null) {
    console.log(a.getLastError().getMessage());
}

const r = f.execute({
    car: {
        color: 'green'
    }
});

console.log(r);

