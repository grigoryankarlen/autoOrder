server = 'http://35.242.195.204:8090';


const data = {
    products: [],
    providers: [],
    daysOfWeek: ['Կիրակի', 'Երկուշաբթի', 'Երեքշաբթի', 'Չորեքշաբթի', 'Հիգշաբթի', 'Ուրբաթ', 'Շաբաթ']
};


function inputChange(input) {
    input.setAttribute('data-value', input.value);
}

function providerClick(providerName) {
    console.log(providerName.dataset.value);
    getItemsBy('products/search', 'keyword', `${providerName.dataset.value}`)
        .then(products => {
            console.log(products);
            templates.product.get.put(products, true);
        });
}

const templates = {

    product: {

        add: {
            create(array) {
                let form = "";
                array.forEach(product => {
                    form += "<div class='product'>";
                    for (let key in product) {
                        if (key === 'history') {
                            form += `<div class="history" style="display: none">${JSON.stringify(product[key])}</div>`;
                        } else if (key === "orderDayOfWeek") {
                            form += `<select name="${key}">`;
                            data.daysOfWeek.forEach((day, index) => {
                                if (index === product[key])
                                    form += `<option value="${index}" selected>${data.daysOfWeek[index]}</option>`;
                                else
                                    form += `<option value="${index}" >${data.daysOfWeek[index]}</option>`;
                            });
                            form += "</select>";
                        } else {
                            form += `<input name="${key}" value="${product[key]}" placeholder="${key}"></input>`;
                        }
                    }
                    form += "<button onclick='action.product.remove(this)' class='removeProduct'></button></div>";
                });
                form += "<button type='button'>Ստեղծել</button>";
                return form;
            },
            put(array) {
                document.querySelector('div.addProducts').style.display = 'flex';
                document.querySelector('div.addProducts').innerHTML = this.create(array);
            }
        },

        get: {
            create(array) {
                let form = "";
                console.log(array);
                array.forEach(product => {
                    form += `<div class="product">
                        <p name="barcode" data-value="${product.barcode}">${product.barcode}</p>
                        <p name="name" data-value="${product.name}">${product.name}</p>
                            <p name="providerName" data-value="${product.providerName}">${product.providerName}</p>
                            <p name="orderDayOfWeek" data-value="${product.orderDayOfWeek}">${data.daysOfWeek[product.orderDayOfWeek]}</p>
                        <button type="button" class="updateProduct" onclick="action.product.update(this)"></button>
                        <div class="history" style="display: none">${JSON.stringify(product.history)}</div>
                        </div>`;

                });
                return form;
            },
            put(array, provider = false) {
                if (provider){
                        document.querySelector('div.providerProducts').innerHTML += this.create(array);
                        document.querySelector('div.providerProducts').style.display = 'block';
                        document.querySelector('div.close').addEventListener('click', () => {
                            document.querySelector('div.providerProducts').style.display = 'none';
                            document.querySelector('div.providerProducts').innerHTML = '<div class="close"></div>';
                        })
                }
                else {
                    // if (!array)
                    //     document.querySelector('div.getProducts').innerHTML += this.create(array[0]);
                    // else
                        document.querySelector('div.getProducts').innerHTML += this.create(array);
                }
            }
        }
    },

    provider: {
        get: {
            create(array) {
                let form = '';
                array.forEach(provider => {
                    form += `<div class="provider">
                            <p name="name" data-value="${provider.name}" onclick="providerClick(this)"> ${provider.name}</p>
                            <p name="email" data-value="${provider.email}"> ${provider.email}</p>
                            <p name="phoneNumber" data-value="${provider.phoneNumber}"> ${provider.phoneNumber}</p>
                            <button type="button" class="updateProvider" onclick="action.provider.update(this)"></button></div>`;
                });
                return form;
            },
            put(array) {
                document.querySelector('.getProviders').innerHTML += this.create(array);
            }
        }
    },

    order: {
        add: {
            create(array1, array2 = null) {
                return new Promise(resolve => {
                    let form = "";
                    array1.forEach(order => {
                        form += `<div class="order" data-red="${false}">
                                <input name="providerName" placeholder="Մատակարար" value="${order.product.providerName}">
                                <input name="productName" placeholder="Ապրանք" value="${order.product.name}">
                                <input name="count" placeholder="Քանակ" value="${order.count}">
                                <button class="removeOrder" onclick="action.order.remove(this)"></button>
                            </div>`;
                    });

                    if (array2) {
                        array2.forEach(order => {
                            form += `<div class="order" data-red="${true}">
                                <input name="providerName" placeholder="Մատակարար" value="${order.providerName}">
                                <input name="productName" placeholder="Ապրանք" value="${order.productName}">
                                <input name="count" placeholder="Քանակ" value="${order.count}">
                                <button class="removeOrder" onclick="action.order.remove(this)"></button>
                            </div>`;
                        });
                    }

                    form += '<button type="button" class="sendOrderList">Պատվիրել</button>';
                    resolve(form);
                });
            },
            put(array1, array2 = null) {

                return this.create(array1, array2).then(form => {
                    document.querySelector('div.sendOrderList').innerHTML = form;
                    document.querySelector('div.sendOrderList').style.display = 'flex';
                });
            }
        },
        get: {
            create(array) {
                let form = "";
                array.forEach(order => {
                    if (!order.successfullyOrdered){
                        form += `<div class="order" data-error="true"">
                        <p name="providerName" data-value="${order.providerName}">${order.providerName}</p>
                        <p name="productName" data-value="${order.productName}">${order.productName}</p>
                        <p name="count" data-value="${order.count}">${order.count}</p>
                    </div>`;
                    }
                    else if (order.minimum){
                        form += `<div class="order" data-red="${true}">
                        <p name="providerName" data-value="${order.providerName}">${order.providerName}</p>
                        <p name="productName" data-value="${order.productName}">${order.productName}</p>
                        <p name="count" data-value="${order.count}">${order.count}</p>
                    </div>`;
                    }
                    else {
                        form += `<div class="order" data-red="${false}">
                        <p name="providerName" data-value="${order.providerName}">${order.providerName}</p>
                        <p name="productName" data-value="${order.productName}">${order.productName}</p>
                        <p name="count" data-value="${order.count}">${order.count}</p>
                    </div>`;
                    }

                });
                return form;
            },
            put(array) {
                let form = '';
                form += this.create(array);
                document.querySelector('div.sendOrderList').innerHTML = form;
            }
        }
    },

};

const pages = {

    hideAll() {
        document.querySelector('div.addProducts').style.display = 'none';
        document.querySelector('div.getProducts').style.display = 'none';
        // document.querySelector('div.addProviders').style.display = 'none';
        document.querySelector('div.getProviders').style.display = 'none';
        document.querySelector('div.providers').style.display = 'none';
        document.querySelector('div.orders').style.display = 'none';
        document.querySelector('div.products').style.display = 'none';
        document.querySelector('div.sendOrderList').style.display = 'none';
    },

    product: {
        click() {
            pages.hideAll();
            document.querySelector('div.products').style.display = 'flex';
        },
        find() {
            pages.hideAll();
            document.querySelector('.getProducts').innerHTML = ' <div class="findProduct">\n' +
                // '        <select class="findProduct">\n' +
                // '            <option value="byName" >Ըստ անվան</option>\n' +
                // '            <option value="byProviderName" >Ըստ մատակարարի</option>\n' +
                // '            <!--        <option value="orderDayOfWeek">Ըստ Պատվերի Օրվա</option>-->\n' +
                // '        </select>\n' +
                '        <input type="text" class="findProduct">\n' +
                '        <button onclick="findProducts();pages.product.find()">Գտնել</button>\n' +
                '<button onclick="pages.product.find();findAllProducts()">Բոլոր ապրանքները</button>' +
                '    </div>';
            document.querySelector('.getProducts').style.display = 'flex';
        },
        add() {
            pages.hideAll();
            document.querySelector('.getProducts').innerHTML = `<div class="addProduct">
                <input type="text" name="barcode" placeholder="Կոդ">
                <input type="text" name="name" placeholder="ԱՆվանում">
                <input type="text" name="providerName" placeholder="Մատակարար">
                <select name="orderDayOfWeek">
                    <option selected disabled hidden>Պատվերի օր</option>
                    <option value="0">${data.daysOfWeek[0]}</option>
                    <option value="1">${data.daysOfWeek[1]}</option>
                    <option value="2">${data.daysOfWeek[2]}</option>
                    <option value="3">${data.daysOfWeek[3]}</option>
                    <option value="4">${data.daysOfWeek[4]}</option>
                    <option value="5">${data.daysOfWeek[5]}</option>
                    <option value="6">${data.daysOfWeek[6]}</option>
                </select>
                <button onclick="addProduct()">Ավելացնել</button>
            </div>`;
            document.querySelector('.getProducts').style.display = 'flex';
        }
    },

    provider: {
        click() {
            pages.hideAll();
            document.querySelector('div.providers').style.display = 'flex';
        },
        find() {
            pages.hideAll();
            document.querySelector('.getProviders').innerHTML =
                `<div class="findProvider">
                    <input name="name" placeholder="Ընկերության անուն">
                    <button onclick="findProviders();pages.provider.find()">Գտնել</button>
                    <button onclick="pages.provider.find();findAllProviders()">Բոլոր Մատակարարները</button>
                </div>`;
            document.querySelector('.getProviders').style.display = 'flex';
        },
        add() {
            pages.hideAll();
            document.querySelector('.getProviders').innerHTML = `
            <div class="addProvider">
                <input name="name" placeholder="Ընկերության անուն">
                <input name="email" placeholder="Էլեկտրոնային հասցե">
                <input name="phoneNumber" placeholder="Հեռախոսի համար">
                <button onclick="addProviders()">Ստեղծել</button>
            </div>`;
            document.querySelector('.getProviders').style.display = 'flex';
        }
    },

    order: {
        click() {
            pages.hideAll();
            document.querySelector('div.orders').style.display = 'flex';
        }
    }

};

const action = {
    product: {
        remove(product) {
            product.parentElement.remove();
        },
        update(product) {
            const parent = product.parentElement;

            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i].tagName === "P") {
                    if (parent.children[i].attributes[0].value === "orderDayOfWeek") {

                        let form = "";
                        form += '<select name="orderDayOfWeek" onchange="inputChange(this)">';
                        for (let j = 0; j < 7; j++) {
                            if (j == parent.children[i].dataset.value) {
                                form += `<option value="${j}" selected>${data.daysOfWeek[j]}</option>`;
                            } else {
                                form += `<option value="${j}">${data.daysOfWeek[j]}</option>`;

                            }
                        }
                        form += '</select>';
                        parent.innerHTML += form;
                    } else {
                        parent.innerHTML +=
                            `<input name="${parent.children[i].attributes[0].value}" value="${parent.children[i].dataset.value}" 
                                placeholder="${parent.children[i].attributes[0].value}" onchange="inputChange(this)">`;
                    }
                    parent.children[i].remove();
                    i--;
                } else if (parent.children[i].tagName === "BUTTON") {
                    parent.innerHTML += `<button class="saveUpdates" onclick="action.product.save(this)"></button>`;
                    parent.children[i].remove();
                }
            }
        },
        save(product) {
            const parent = product.parentElement;
            const body = {};

            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i].tagName === "INPUT") {
                    body[parent.children[i].attributes[0].value] = parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value;


                    parent.innerHTML +=
                        `<p name="${parent.children[i].attributes[0].value}"
                         data-value="${body[parent.children[i].attributes[0].value] =
                            parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value}">
                        ${body[parent.children[i].attributes[0].value] =
                            parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value}</p>`;
                    parent.children[i].remove();
                    i--;
                } else if (parent.children[i].tagName === "SELECT") {
                    body[parent.children[i].attributes[0].value] = parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value;
                    parent.innerHTML +=
                        `<p name="${parent.children[i].attributes[0].value}"
                           data-value="${parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value}">
                            ${data.daysOfWeek[parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value]}</p>`;
                    parent.children[i].remove();
                    i--;
                } else if (parent.children[i].tagName === "BUTTON") {
                    parent.innerHTML += `<button class="updateProduct" onclick="action.product.update(this)"></button>`;
                    parent.children[i].remove();
                } else if (parent.children[i].tagName === "DIV") {
                    body[parent.children[i].className] = JSON.parse(parent.children[i].innerHTML);
                }
            }

            // console.log(body);
            addItem('products', [body]);

        }
    },
    provider: {
        update(provider) {
            const parent = provider.parentElement;

            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i].tagName === "P") {
                    parent.innerHTML +=
                        `<input name="${parent.children[i].attributes[0].value}" 
                            value="${parent.children[i].dataset.value}" 
                            placeholder="${parent.children[i].attributes[0].value}" onchange="inputChange(this)">`;
                    parent.children[i].remove();
                    i--;
                } else if (parent.children[i].tagName === "BUTTON") {
                    parent.innerHTML += `<button class="saveUpdates" onclick="action.provider.save(this)"></button>`;
                    parent.children[i].remove();
                }
            }
        },
        save(provider) {
            const parent = provider.parentElement;
            const body = {};

            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i].tagName === "INPUT") {
                    body[parent.children[i].attributes[0].value] =
                        parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value;
                    if (parent.children[i].name === 'name') {
                        parent.innerHTML +=
                            `<p name="${parent.children[i].attributes[0].value}" 
                            data-value="${parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value}"
                            onclick='providerClick(this)'>
                            ${parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value}</p>`;
                    } else {
                        parent.innerHTML +=
                            `<p name="${parent.children[i].attributes[0].value}" 
                            data-value="${parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value}">
                            ${parent.children[i].dataset.value ? parent.children[i].dataset.value : parent.children[i].value}</p>`;
                    }
                    parent.children[i].remove();
                    i--;
                } else if (parent.children[i].tagName === "BUTTON") {
                    parent.innerHTML += `<button class="updateProduct" onclick="action.provider.update(this)"></button>`;
                    parent.children[i].remove();
                }
            }
            // console.log(body);
            addItem('providers', body);

        }

    },
    order: {
        remove(order) {
            order.parentElement.remove();
        }
    }
};


function addItem(item, body) {
    return new Promise(resolve => {
        ajax('post', `/${item}`, body)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log(error);
            });
    });
}

function getAllItems(item) {
    return new Promise(resolve => {
        ajax('get', `/${item}`)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log(error)
            });
    })
}

function getItemsBy(item, by, body) {
    return new Promise(resolve => {
        ajax('get', `/${item}?${by}=${body}`)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log(error);
            });
    });
}

function getOrderList(array) {
    return new Promise(resolve => {
        ajax('post', `/products/ordering`, array)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log(error);
            });
    })
}

function addOrders(array) {
    return new Promise(resolve => {
        let orders = [];
        array.day.forEach(order => {
            order.minimum = false;
            orders.push(order);
        });
        array.min.forEach(order => {
            order.minimum = true;
            orders.push(order);
        });
        ajax('post', `/orders`, orders)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log(error);
            });
    });
}


function sync() {

    pages.hideAll();
    responseAllProducts().then(products => {
        templates.product.add.put(products);
        const form = document.querySelector('div.addProducts');
        document.querySelector('.addProducts > button').onclick = () => {
            let body = [];
            for (let child of form.children) {
                if (child.tagName === 'DIV') {
                    let item = {};
                    for (let input of child.children) {
                        if (input.tagName === "INPUT") {
                            item[input.name] = input.value;
                        } else if (input.tagName === "DIV") {
                            item[input.className] = JSON.parse(input.innerHTML);
                        } else {
                            item[input.name] = input.value;
                        }
                    }
                    body.push(item);
                }
            }
            // console.log(body);
            addItem('products', body)
                .then(response => {
                    templates.product.get.put(response);
                });
        };
    });
}

function addProviders() {
    let body = {};
    const form = document.querySelector('div.addProvider');
    for (let child of form.children) {
        if (child.tagName !== "BUTTON") {
            body[child.name] = child.value;
        }
    }
    // templates.provider.get.put(body);

    addItem('providers', body)
        .then(response => {
            templates.provider.get.put([response]);
        });

}

function addProduct() {
    const form = document.querySelector('.addProduct');
    let body = [{}];
    for (let child of form.children) {
        if (child.tagName !== "BUTTON") {
            body[0][child.name] = child.value;
        }
    }
    // templates.product.get.put(body);
    addItem('products', body)
        .then(response => {
            templates.product.get.put([response]);
        });
}

function findProducts() {
    let body = document.querySelector('input.findProduct').value;

    getItemsBy('products/search', 'keyword', body)
        .then(response => {
            templates.product.get.put(response);
        });
}

function findProviders() {
    let body = document.querySelector('div.findProvider > input').value;

    // templates.provider.get.put([{
    //         'name': 'ala',
    //         'email': 'asdasd',
    //         'phoneNumber': 'asdasd'
    //     },
    //     {
    //         name: 'ala',
    //         email: 'asdasd',
    //         phoneNumber: 'asdasd'
    //     }]);

    getItemsBy('providers', 'byName', body)
        .then(response => {
            templates.provider.get.put(response);
        });
}

function findAllProducts() {
    getAllItems('products')
        .then(response => {
            templates.product.get.put(response);
        });
}

function findAllProviders() {
    getAllItems('providers')
        .then(response => {
            templates.provider.get.put(response);
        });
}


function responseAllProducts() {

    function randomHistory(date) {
        let history = [];
        for (let i = 0; i < 60; i++) {
            let max = Math.floor(Math.random() * 1000 + 700),
                min = Math.floor(Math.random() * 500 + 100);
            history.push({
                orderedDate: date,
                count: Math.floor(Math.random() * (max - min) + min)
            });
            date.setDate(date.getDate() - 7);

        }
        return history;
    }

    function randomDate() {
        return new Promise(resolve => {
            let date = new Date(Date.now());
            date.setDate(date.getDate() - (Math.floor(Math.random() * 6 + 1)));
            resolve(date);
        });
    }


    return new Promise(resolve => {
        let products = [
            {
                barcode: '11235469',
                name: 'Coca Cola',
                providerName: 'Coca Cola Company',
            },
            {
                barcode: '21235469',
                name: 'Fanta Cola',
                providerName: 'Coca Cola Company',
            },
            {
                barcode: '31235469',
                name: 'Pepsi',
                providerName: ''
            },
            {
                barcode: '41235469',
                name: 'Jermuk',
                providerName: 'Jermuk Group',
            },
            {
                barcode: '19235469',
                name: 'Ideal',
                providerName: 'Grand Cendy Company',
            },
        ];
        products.forEach(product => {
            randomDate().then(date => {
                product.orderDayOfWeek = date.getDay();
                product.history = randomHistory(date);
            });
        });
        resolve(products);
    })

}

function responseDayProducts(productsArray) {
    return new Promise(resolve => {
        let day = [];
        productsArray.forEach(product => {
            product.history.unshift({
                orderedDate: new Date(Date.now()),
                count: (Math.floor(Math.random() * 1000 + 300))
            });
            day.push({
                product: product,
                warehouse: (Math.floor(Math.random() * 500))
            });
        });
        let min = [];
        min.push({
            productName: 'Coca Cola',
            warehouse: (Math.floor(Math.random() * 100))
        });
        resolve({
            day: day,
            min: min
        });
    });
}

function responseOrderList() {
    return new Promise(resolve => {
        let form = [];
        for (let i = 0; i < 20; i++) {
            form.push({
                productName: Math.random().toString(36).substring(7),
                providerName: Math.random().toString(36).substring(2),
                count: Math.floor(Math.random() * 1000)
            });
        }
        resolve(form);
    });
}


function order() {
    getItemsBy('products', 'orderDayOfWeek', new Date(Date.now()).getDay())
        .then(response => {
            return responseDayProducts(response);
        })
        .then(products => {
            return getOrderList(products);
        })
        .then(orderList => {
            templates.order.add.put(orderList.day, orderList.min).then(() => {
                document.querySelector('button.sendOrderList').onclick = () => {
                    let form = document.querySelector('div.sendOrderList');
                    let body = {
                        day: [],
                        min: []
                    };
                    for (let child of form.children) {
                        if (child.tagName === "DIV") {
                            let item = {};
                            for (let input of child.children) {
                                if (input.tagName === "INPUT") {
                                    item[input.name] = input.value;
                                }
                            }
                            if (child.dataset.red === 'true')
                                body.min.push(item);
                            else
                                body.day.push(item);
                        }
                    }
                    addOrders(body)
                        .then(orders => {
                            templates.order.get.put(orders);
                        });
                };
            });

        });
}


function ajax(met, url, body) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.open(met, server + url);
        request.responseType = "json";
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = () => {
            if (request.status >= 400) {
                reject(request.response);
            } else {
                resolve(request.response);
            }
        };

        request.onerror = () => {
            reject(request.response);
        };

        request.send(JSON.stringify(body));
    });
}
