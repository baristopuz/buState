class StatefulUIManager {
    constructor(containerId, initialState, computedStateConfig = {}) {
        this.containerElement = document.getElementById(containerId);
        if (!this.containerElement) {
            throw 'bApp Uygulaması Başlatılamadı';
        }
        this.state = { ...initialState };
        this.computedStateConfig = computedStateConfig;
        this.resultElements = this.findElementsWithStatePlaceholder();
        this.placeholderMap = this.createPlaceholderMap();

        this.proxyState = new Proxy(this.state, {
            set: (target, property, value) => {
                target[property] = value;
                this.updateComputedProperties(property);
                this.updateUI(property);
                return true;
            }
        });
        this.updateComputedProperties();
        this.updateUI();
        this.init();
    }

    findElementsWithStatePlaceholder() {
        const elementsWithStatePlaceholder = [];

        function searchInElement(element) {
            const { TEXT_NODE, ELEMENT_NODE } = Node;

            if (element.nodeType === TEXT_NODE) {
                const pattern = /\${(?:html:)?\s*([^{}]+)\s*}/g;
                const matches = element.nodeValue.match(pattern);
                if (matches) {
                    elementsWithStatePlaceholder.push({
                        element: element.parentElement,
                        placeholders: matches.map(match => match.trim()),
                        originalText: element.nodeValue.trim(),
                    });
                }
            } else if (element.nodeType === ELEMENT_NODE) {
                const childNodes = element.childNodes;
                for (const childNode of childNodes) {
                    searchInElement(childNode);
                }
            }
        }

        searchInElement(this.containerElement);
        return elementsWithStatePlaceholder;
    }

    createPlaceholderMap() {
        const placeholderMap = {};

        for (const elementInfo of this.resultElements) {
            for (const placeholder of elementInfo.placeholders) {
                const key = this.extractStateKey(placeholder);
                if (key) {
                    if (!placeholderMap[key]) {
                        placeholderMap[key] = [];
                    }
                    placeholderMap[key].push(elementInfo);
                }
            }
        }

        return placeholderMap;
    }

    extractStateKey(placeholder) {
        const isHtmlPlaceholder = placeholder.match(/\${\s*html\s*:\s*(.*?)\s*}/);
        const value = isHtmlPlaceholder ? this.extractHtmlValue(placeholder.trim()) : placeholder.slice(2, -1).trim();
        return value;
    }

    updateUI(changedProperty = null) {
        const startTime = performance.now();

        if (changedProperty && this.placeholderMap[changedProperty]) {
            const affectedElements = this.placeholderMap[changedProperty];

            for (const elementInfo of affectedElements) {
                let updatedText = elementInfo.originalText;
                let isHtmlState = false;

                for (const placeholder of elementInfo.placeholders) {
                    const isHtmlPlaceholder = placeholder.match(/\${\s*html\s*:\s*(.*?)\s*}/);
                    const value = isHtmlPlaceholder ? this.extractHtmlValue(placeholder.trim()) : placeholder.slice(2, -1).trim();

                    if (isHtmlPlaceholder) isHtmlState = true;

                    if (value in this.state) {
                        const updatedValue = this.state[value];
                        updatedText = updatedText.replace(placeholder, updatedValue);
                    } else {
                        updatedText = updatedText.replace(placeholder, "");
                    }
                }

                if (isHtmlState) {
                    elementInfo.element.innerHTML = updatedText;
                } else {
                    elementInfo.element.childNodes[0].nodeValue = updatedText;
                }

                elementInfo.element.dataset.transferred = true;
            }
        } else if (!changedProperty) {
            // Full update if no specific property is changed
            for (const elementInfo of this.resultElements) {
                let updatedText = elementInfo.originalText;
                let isHtmlState = false;

                for (const placeholder of elementInfo.placeholders) {
                    const isHtmlPlaceholder = placeholder.match(/\${\s*html\s*:\s*(.*?)\s*}/);
                    const value = isHtmlPlaceholder ? this.extractHtmlValue(placeholder.trim()) : placeholder.slice(2, -1).trim();

                    if (isHtmlPlaceholder) isHtmlState = true;

                    if (value in this.state) {
                        const updatedValue = this.state[value];
                        updatedText = updatedText.replace(placeholder, updatedValue);
                    } else {
                        updatedText = updatedText.replace(placeholder, "");
                    }
                }

                if (isHtmlState) {
                    elementInfo.element.innerHTML = updatedText;
                } else {
                    elementInfo.element.childNodes[0].nodeValue = updatedText;
                }

                elementInfo.element.dataset.transferred = true;
            }
        }

        const endTime = performance.now();
        console.log("Arayüzün güncellenmesi " + Math.round(endTime - startTime) + " milisaniye sürdü");
    }

    extractHtmlValue(input) {
        const regex = /\${\s*html\s*:\s*(.*?)\s*}/;
        const match = input.match(regex);
        if (match) {
            return match[1];
        }
        return null;
    }

    updateComputedProperties(changedProperty = null) {
        for (const [key, computeFunc] of Object.entries(this.computedStateConfig)) {
            if (!changedProperty || computeFunc.dependencies.includes(changedProperty)) {
                this.state[key] = computeFunc.compute(this.state);
                this.updateUI(key);
            }
        }
    }

    init() {
        let _self = this;
        window.addEventListener("DOMContentLoaded", () => {
            _self.containerElement.classList.add('app-ready');
            _self.containerElement.dataset.appReady = true;
        });
    }
}

const initialState = {
    name1: ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Zeynep", "Emre", "Ceren", "Can", "Elif"][Math.floor(Math.random() * 10)],
    name2: ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Zeynep", "Emre", "Ceren", "Can", "Elif"][Math.floor(Math.random() * 10)],
    date: new Date(),
    count: 0,
    testHtml: '<div><a href="#">Html Elementi</a></div>',
    number1: 5,
    number2: 8,
    number3: 0,
};

const computedStateConfig = {
    number3: {
        dependencies: ['number1', 'number2'],
        compute: (state) => sumState(state.number1, state.number2)
    }
};

const statefulUI = new StatefulUIManager("bApp", initialState, computedStateConfig);

function sumState(a, b) {
    return a + b;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

setTimeout(() => {
    statefulUI.proxyState.number1 = randomIntFromInterval(0, 50);
}, 2000);


document.querySelector('input[name="name1"]').addEventListener('input', function (e) {
    statefulUI.proxyState.name1 = e.target.value;
});

document.querySelector('input[name="name2"]').addEventListener('input', function (e) {
    statefulUI.proxyState.name2 = e.target.value;
});

document.querySelector('#btn2').addEventListener('click', function (e) {
    statefulUI.proxyState.date = new Date()
});

document.querySelector('#inc').addEventListener('click', function (e) {
    statefulUI.proxyState.count++;
});

document.querySelector('#dec').addEventListener('click', function (e) {
    statefulUI.proxyState.count--;
});

document.querySelector('#btn3').addEventListener('click', function (e) {
    fetch('https://dummyjson.com/products/1')
        .then(res => res.json())
        .then(json => {
            statefulUI.proxyState.test = JSON.stringify(json);
        });
});