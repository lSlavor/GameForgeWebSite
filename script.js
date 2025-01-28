// Список товаров
// Список товаров загружается динамически из базы данных
let products = [];

async function fetchProducts() {
    try {
        const response = await fetch('/api/products'); // Запрос к серверу
        if (!response.ok) {
            throw new Error('Ошибка соединения с сервером.');
        }
        products = await response.json(); // Загружаем данные
        if (products.length === 0) {
            throw new Error('Каталог товаров пуст.');
        }
        loadCatalog(); // Загрузка каталога
    } catch (error) {
        console.error('Ошибка:', error);
        products = []; // Очистка списка товаров
        showErrorMessage(error.message || 'Произошла ошибка.');
    }
}

function showErrorMessage(message) {
    // Показать сообщение об ошибке
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = `Ошибка: ${message}`;
    errorMessage.style.display = 'block'; // Показать сообщение

    // Скрыть секцию "configurator-section"
    const configuratorSection = document.getElementById('configuratorSection');
    if (configuratorSection) {
        configuratorSection.style.display = 'none'; // Скрыть элемент
    }
}



// Вызываем загрузку товаров при старте приложения
fetchProducts();


let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Обновление количества товаров в корзине
function updateCartSummary() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = cartCount);
}

// Загрузка каталога
function loadCatalog() {
    const productList = document.getElementById('product-list');
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Цена: ${product.price} руб</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Добавить в корзину</button>
        `;
        productList.appendChild(productCard);
    });
}

// Добавление в корзину с анимацией
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();
    
    // Создание и анимация кружка
    const productButton = event.target; // Получаем кнопку "Добавить в корзину"
    const cartIcon = document.querySelector('.cart-icon'); // Иконка корзины

    const circle = document.createElement('div');
    circle.classList.add('cart-icon-animation');
    document.body.appendChild(circle);

    // Позиционируем кружок относительно кнопки
    const rect = productButton.getBoundingClientRect();
    circle.style.left = `${rect.left + rect.width / 2 - 15}px`;
    circle.style.top = `${rect.top + rect.height / 2 - 15}px`;

    // Анимация движения круга к корзине
    const cartRect = cartIcon.getBoundingClientRect();
    setTimeout(() => {
        circle.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`;
        circle.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;
    }, 0);

    // Удаление круга после завершения анимации
    circle.addEventListener('animationend', () => {
        circle.remove();
    });
}

// Загрузка корзины
function loadCartItems() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Очищаем содержимое корзины

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Корзина пуста</p>';
        return;
    }

    // Заполняем корзину товарами
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-price">${item.price} руб</div>
            <div class="item-quantity">Кол-во: ${item.quantity}</div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Удалить</button>
        `;

        cartItems.appendChild(cartItem);
    });

    updateTotalPrice(); // Обновляем итоговую цену
}

// Удаление из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartSummary();

    // Обновление общей суммы, даже если корзина пуста
    updateTotalPrice();
}

// Обновление общей суммы
function updateTotalPrice() {
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('total-price').textContent = totalPrice; // Обновляем отображение общей суммы
}


// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        updateTotalPrice(); // Обновляем итоговую цену, даже если корзина пуста
        return;
    }

    alert('Спасибо за ваш заказ!');
    cart = []; // Очищаем корзину
    localStorage.setItem('cart', JSON.stringify(cart)); // Сохраняем пустую корзину в localStorage

    // Обновляем UI сразу после очистки корзины
    loadCartItems(); // Перезагружаем корзину и очищаем все элементы
    updateCartSummary(); // Обновляем количество товаров в корзине
    updateTotalPrice(); // Обновляем итоговую цену (ставим её в 0)
    document.getElementById('total-price').textContent = 0; // Обновляем отображение общей суммы
}

// Инициализация
window.onload = () => {
    if (document.getElementById('product-list')) {
        loadCatalog();
    } else if (document.getElementById('cart-items')) {
        loadCartItems();
    }
    updateCartSummary();
};


// Открытие модального окна
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


// Оформление заказа
function submitOrder() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!firstName || !lastName || !phone || !address) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    const orderData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
        items: cart
    };

    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        const contentType = response.headers.get('Content-Type');
        
        // Проверка, что ответ в формате JSON
        if (!response.ok) {
            if (contentType && contentType.includes('application/json')) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Ошибка сервера');
                });
            } else {
                // Если сервер возвращает HTML (ошибка подключения к базе данных)
                throw new Error(`Ошибка 503: Сервер временно недоступен или отсутствует база данных.`);
            }
        }
        return response.text();
    })
    .then(message => {
        alert(message);
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartSummary();
        updateTotalPrice();
        closeModal();
    })
    .catch(error => {
        alert('Произошла ошибка: ' + error.message);
    });
}



// Список цен для компонентов
const componentPrices = {
    ryzen5: 20000,
    i7: 25000,
    ryzen7: 30000,
    i9: 35000,
    rtx3060: 25000,
    rtx3070: 30000,
    rx6800: 35000,
    rtx3080: 45000,
    "16gb": 5000,
    "32gb": 10000,
    "64gb": 15000
};

// Открытие модального окна конфигуратора
function openConfigurator() {
    const modal = document.getElementById('configurator-modal');
    modal.style.display = 'block';

    // Привязка обработчиков событий
    document.getElementById('cpu').addEventListener('change', updateConfigPrice);
    document.getElementById('gpu').addEventListener('change', updateConfigPrice);
    document.getElementById('ram').addEventListener('change', updateConfigPrice);
}

// Закрытие модального окна конфигуратора
function closeConfigurator() {
    const modal = document.getElementById('configurator-modal');
    modal.style.display = 'none';

    // Удаление обработчиков событий
    document.getElementById('cpu').removeEventListener('change', updateConfigPrice);
    document.getElementById('gpu').removeEventListener('change', updateConfigPrice);
    document.getElementById('ram').removeEventListener('change', updateConfigPrice);
}

// Обновление цены на основе выбранных компонентов
function updateConfigPrice() {
    const cpu = document.getElementById('cpu').value;
    const gpu = document.getElementById('gpu').value;
    const ram = document.getElementById('ram').value;

    const price = componentPrices[cpu] + componentPrices[gpu] + componentPrices[ram];
    document.getElementById('config-price').textContent = price;
}


// Добавление собранного ПК в корзину
function addToCartFromConfigurator() {
    const cpu = document.getElementById('cpu').value;
    const gpu = document.getElementById('gpu').value;
    const ram = document.getElementById('ram').value;

    const price = componentPrices[cpu] + componentPrices[gpu] + componentPrices[ram];
    const productName = `${cpu} / ${gpu} / ${ram}`;

    // Добавляем собранный ПК в корзину
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: Date.now(), name: productName, price: price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();
    closeConfigurator();
}


document.getElementById('question-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем стандартное поведение формы

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const questionText = document.getElementById('question-text').value.trim();

    // Проверяем, что поля заполнены
    if (!name || !phone || !questionText) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    // Валидация имени: только буквы и пробелы
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
    if (!nameRegex.test(name)) {
        alert('Имя должно содержать только буквы и пробелы.');
        return;
    }

    // Валидация телефона: допустимы цифры и символы +, -, ()
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneRegex.test(phone)) {
        alert('Введите корректный номер телефона.');
        return;
    }

    // Отправка данных на сервер
    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, phone, question_text: questionText }),
        });

        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                document.getElementById('form-message').textContent = 'Ваш вопрос успешно отправлен!';
                document.getElementById('question-form').reset(); // Очищаем форму
            } else {
                throw new Error('Сервер вернул неожиданный ответ. Возможно, отсутствует база данных.');
            }
        } else {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                alert(errorData.error || 'Ошибка при отправке вопроса. Пожалуйста, попробуйте позже.');
            } else {
                throw new Error('503: Service Unavailable. Сервер недоступен. Ошибка обращения к базе данных.');
            }
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error.message);
    }
});

