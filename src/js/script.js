export class StatefulUIManager {
    constructor(containerId, initialState) {
        this.containerElement = document.getElementById(containerId);
        if (!this.containerElement) {
            throw 'bApp Uygulaması Başlatılamadı';
        }
        this.state = { ...initialState };
        this.resultElements = this.findElementsWithStatePlaceholder();

        this.proxyState = new Proxy(this.state, {
            set: (target, property, value) => {
                target[property] = value;
                this.updateUI();
                return true;
            }
        });
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

    updateUI() {
        const startTime = performance.now();

        for (const elementInfo of this.resultElements) {
            let updatedText = elementInfo.originalText;
            let contentUpdated = false;

            for (const placeholder of elementInfo.placeholders) {
                const pattern = /\${\s*html\s*:\s*(.*?)\s*}/;
                const isHtmlPlaceholder = placeholder.match(pattern);

                const value = isHtmlPlaceholder ? this.extractHtmlValue(placeholder.trim()) : placeholder.slice(2, -1).trim();
                console.log(value);

                if (value in this.state) {
                    const updatedValue = this.state[value];
                    updatedText = updatedText.replace(placeholder, updatedValue);
                    contentUpdated = true;
                } else {
                    updatedText = updatedText.replace(placeholder, "");
                }
            }

            if (contentUpdated) {
                elementInfo.element.innerHTML = updatedText; // Use innerHTML instead of textContent
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
    count: 0
};

const statefulUI = new StatefulUIManager("bApp", initialState);

window.addEventListener("DOMContentLoaded", (event) => {
    let bApp = document.getElementById("bApp");
    bApp.classList.add('app-ready');
    bApp.dataset.appReady = true;
});


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
        anotherFunc();
});

function anotherFunc(){
    console.log('anotherFunc');
    setTimeout(() => {
        statefulUI.proxyState.test = 'Veri Güncellendi';
    }, 2000);
}

// setInterval(() => {
//     let d = new Date();
//     statefulUI.proxyState.tarih = d.getTime();
// }, 10);

// let i = 0;
// setInterval(() => {
//     i++;
//     statefulUI.proxyState.name1 = i;
// }, 100);
