const express = require('express');
const { Client } = require('pg');
const path = require('path');
const app = express();
const port = 3000;

// Подключение к базе данных PostgreSQL
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gameforge_system',
    password: '1234',
    port: 5432,
});
client.connect();

// Middleware для обработки JSON и статики
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Создание заказа
app.post('/api/orders', async (req, res) => {
    try {
        const { first_name, last_name, phone, address, items } = req.body;

        // Вставка данных в таблицу orders
        const orderResult = await client.query(
            'INSERT INTO orders (first_name, last_name, phone, address) VALUES ($1, $2, $3, $4) RETURNING id',
            [first_name, last_name, phone, address]
        );

        const orderId = orderResult.rows[0].id;

        // Вставка данных в таблицу order_items
        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, product_name, product_price, quantity) VALUES ($1, $2, $3, $4)',
                [orderId, item.name, item.price, item.quantity]
            );
        }

        res.status(200).send('Заказ успешно оформлен!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
