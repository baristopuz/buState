
# StatefulUIManager

```html
<p>Name1 : ${name1}</p>
<p>Name 1, Name 2, Tarih : ${name1} - ${name2} - ${date}</p>
<p data-dynamic-state>${html:testHtml}</p>

<div class="sum">
    <div>${number1}</div>
    <div>${number2}</div>
    <div>Toplam: ${number3}</div>
</div>
```

```javascript
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
```

### Constructor (constructor)
Parametreler:

containerId: UI'nin yer alacağı konteynerin ID'si.
initialState: Başlangıç durumu.
computedStateConfig: Hesaplanmış durumlar için konfigürasyon.

İşlem:

containerElement: containerId ile belirtilen HTML öğesini bulur.
state: Başlangıç durumu initialState ile initialize edilir.
computedStateConfig: Hesaplanmış durum konfigürasyonları initialize edilir.
resultElements: findElementsWithStatePlaceholder metodunu çağırarak, duruma bağlı placeholder'ları içeren öğeleri bulur.
placeholderMap: createPlaceholderMap metodunu çağırarak placeholder'ları bir haritada organize eder.
proxyState: Proxy kullanarak durumu yönetir ve durum değişikliklerinde UI'yi otomatik olarak günceller.
updateComputedProperties ve updateUI: Başlangıçta hesaplanmış durumları ve UI'yi günceller.
init: Sınıfı başlatır ve gerekli olay dinleyicilerini ekler.

### findElementsWithStatePlaceholder
İşlem:
containerElement içindeki tüm metin düğümlerini (TEXT_NODE) ve HTML düğümlerini (ELEMENT_NODE) tarar.
${} formatında placeholder'lar içeren metin düğümlerini bulur ve elementsWithStatePlaceholder dizisine ekler.

### createPlaceholderMap
İşlem:
Placeholder'ları içeren öğeleri (resultElements) dolaşarak, her bir placeholder'ı ilgili durum anahtarına (state key) göre organize eder ve bir harita (placeholderMap) oluşturur.

### extractStateKey
İşlem:
Placeholder'dan duruma ait anahtarı (state key) çıkarır. Eğer placeholder html: içeriyorsa, extractHtmlValue metodunu kullanarak değeri çıkarır; değilse, doğrudan placeholder'ın içeriğini alır.

### updateUI
Parametreler:
changedProperty: Değişen durum anahtarı (opsiyonel).

İşlem:
Eğer belirli bir durum anahtarı değişmişse, sadece o anahtara bağlı öğeleri günceller.
Eğer changedProperty belirtilmemişse, tüm UI öğelerini günceller.
Her bir öğedeki placeholder'ları yeni durum değerleri ile değiştirir. Eğer html: kullanılıyorsa innerHTML, değilse nodeValue ile günceller.
Güncellemenin ne kadar sürdüğünü konsola yazdırır.

### extractHtmlValue
İşlem:
Placeholder'dan html: içeren değeri çıkarır ve döndürür.

### updateComputedProperties
Parametreler:
changedProperty: Değişen durum anahtarı (opsiyonel).

İşlem:
computedStateConfig'de tanımlı her bir hesaplanmış durumu günceller. Eğer changedProperty belirtilmişse, sadece bu anahtara bağlı olan hesaplanmış durumları günceller.
Hesaplanmış durum güncellemeleri sırasında ilgili UI öğelerini de günceller (updateUI metodunu çağırarak).

### init
İşlem:
DOMContentLoaded olayını dinleyerek, DOM yüklendiğinde konteyner öğesine app-ready sınıfı ekler ve appReady veri özelliğini true olarak ayarlar.
