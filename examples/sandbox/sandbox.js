import './blocks/styles.css';

const expr4js = new expr4.default();
const exprInput = document.getElementById('expression');
const modelInput = document.getElementById('model');
const resultOutput = document.getElementById('result');
const exampleListInput = document.getElementById('exampleList');
const examplesModel = {
    example_1: {
        title: 'Example1',
        model: {
            car: {
                color: "red"
            }
        },
        expression: 'car.color == "red"'
    },
    example_2: {
        title: 'Example2',
        model: {
            a: 5,
            b: 2
        },
        expression: '(a + 5) * b'
    },
    example_3: {
        title: 'Example3',
        model: {
            first: 'Hello, ',
            second: 'Guest'
        },
        expression: 'first + second'
    },
};

exampleListInput.addEventListener('click', (e) => {
    const exampleId = e.target.getAttribute('data-example');

    if (! exampleId) {
        return;
    }

    setExample(exampleId);
});

exprInput.addEventListener('input', () => {
    evalExpression();
});

modelInput.addEventListener('input', () => {
    evalExpression();
});

function evalExpression() {
    const modelRaw = modelInput.value.trim();
    const input = exprInput.value.trim();

    if (modelRaw.length === 0 || input.length === 0) {
        resultOutput.textContent = '';
        return;
    }

    const model = JSON.parse(modelRaw);

    const parsed = expr4js.parse(exprInput.value);

    if (parsed === null) {
        if (expr4js.getLastError()) {
            resultOutput.textContent = expr4js.getLastError().getMessage();
        }
    } else {
        resultOutput.textContent =  parsed.execute(model);
    }
}

function setExample(id) {
    const example = examplesModel[id] || null;

    if (! example) {
        return;
    }

    modelInput.value = JSON.stringify(example.model);
    exprInput.value = example.expression;
    evalExpression();
}


setExample('example_1');
