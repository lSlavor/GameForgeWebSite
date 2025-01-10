// Список товаров
const products = [
    { id: 1, name: 'ПК для игр Ryzen 5 5600X / RTX 3060 Ti', price: 75000, image: 'images/pc1.jpg' },
    { id: 2, name: 'ПК для игр Intel Core i7 11700K / RTX 3070', price: 95000, image: 'images/pc2.jpg' },
    { id: 3, name: 'Игровой ПК AMD Ryzen 7 5800X / RX 6800', price: 120000, image: 'images/pc3.jpg' },
    { id: 4, name: 'Игровой ПК Intel Core i9 12900K / RTX 3080 Ti', price: 150000, image: 'images/pc4.jpg' },
    { id: 5, name: 'ПК для киберспорта Ryzen 7 7700X / RTX 4060', price: 135000, image: 'images/pc5.jpg' },
    { id: 6, name: 'Ультрагеймерский ПК Intel Core i9 13900K / RTX 5090', price: 549000, image: 'images/pc6.jpg' }
];


let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Обновление количества товаров в корзине
function updateCartSummary() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = cartCount);
}

// Загрузка каталога
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


// Добавление в корзину
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
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

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
    .then(response => response.text())
    .then(message => {
        alert(message);
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartSummary();
        updateTotalPrice();
        closeModal();
    })
    .catch(error => console.error('Ошибка:', error));
}

