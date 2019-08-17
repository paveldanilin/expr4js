import './blocks/styles.css';

const expr4js = new expr4.default();
const exprInput = document.getElementById('expression');
const modelInput = document.getElementById('model');
const resultOutput = document.getElementById('result');
const exampleListInput = document.getElementById('exampleList');
const examplesModel = {
    example_1: {
        title: 'Dot access',
        model: {
            car: {
                color: "red"
            }
        },
        expression: 'car.color == "red"'
    },
    example_2: {
        title: 'Arithmetic',
        model: {
            a: 5,
            b: 2
        },
        expression: '(a + 5) * b'
    },
    example_3: {
        title: 'String concat',
        model: {
            first: 'Hello, ',
            second: 'Guest'
        },
        expression: 'first + second'
    },
    example_4: {
        title: 'Logic "and"',
        model: {
            a: 1,
            b: 10,
            c: 10,
            d: 1
        },
        expression: '(a + b) == 11 and 11 == (c + d)'
    }
};
const listItemClasses = ['list__item', 'list__item_border-bottom', 'list__item_indent-b-m', 'list__item_over'];

Object.keys(examplesModel).forEach((exampleKey) => {
    const liElement = document.createElement('li');
    liElement.setAttribute('data-example', exampleKey);
    liElement.textContent = examplesModel[exampleKey].title;
    listItemClasses.forEach((className) => liElement.classList.add(className));
    exampleListInput.appendChild(liElement);

});
setExample(Object.keys(examplesModel)[0]);


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

    Array.from(exampleListInput.children).forEach((liElement) => {
        if (liElement.getAttribute('data-example') === id) {
            liElement.classList.add('list__item_focus');
        } else {
            liElement.classList.remove('list__item_focus');
        }
    });

    modelInput.value = JSON.stringify(example.model);
    exprInput.value = example.expression;
    evalExpression();
}


//setExample('example_1');
