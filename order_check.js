document.getElementById('order-check-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем стандартное поведение формы

    const phoneInput = document.getElementById('phone-input').value.trim();

    // Простая валидация номера телефона
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneRegex.test(phoneInput)) {
        alert('Введите корректный номер телефона.');
        return;
    }

    try {
        const response = await fetch('/api/check-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: phoneInput }),
        });

        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                displayOrderDetails(data);
            } else {
                throw new Error('Сервер вернул неожиданный ответ. Возможно, отсутствует база данных.');
            }
        } else {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                alert(error.message || 'Ошибка при проверке заказа.');
            } else {
                throw new Error('503: Service Unavailable. Сервер недоступен. Ошибка обращения к базе данных.');
            }
        }
    } catch (error) {
        alert('Произошла ошибка: ' + error.message);
    }
});

// Отображаем данные заказа
function displayOrderDetails(order) {
    const orderDetailsDiv = document.getElementById('order-details');
    if (order) {
        orderDetailsDiv.innerHTML = `
            <h3>Детали заказа</h3>
            <p><strong>Имя:</strong> ${order.first_name} ${order.last_name}</p>
            <p><strong>Телефон:</strong> ${order.phone}</p>
            <p><strong>Адрес:</strong> ${order.address}</p>
            <p><strong>Дата заказа:</strong> ${new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Статус:</strong> ${order.status}</p>
            <h4>Состав заказа:</h4>
            <ul>
                ${order.items.map(item => `
                    <li>${item.product_name} - ${item.quantity} шт. (Цена: ${item.product_price} руб.)</li>
                `).join('')}
            </ul>
        `;
    } else {
        orderDetailsDiv.innerHTML = '<p>Заказ не найден.</p>';
    }
    orderDetailsDiv.classList.remove('hidden');
}
