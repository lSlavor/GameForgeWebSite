const express = require('express');
const { Client } = require('pg');
const path = require('path');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

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
app.use(bodyParser.json());

// Создание заказа
app.post('/api/orders', async (req, res) => {
    try {
        const { first_name, last_name, phone, address, items } = req.body;

        // Проверка на существующий номер телефона
        const phoneCheck = await client.query(
            'SELECT id FROM orders WHERE phone = $1',
            [phone]
        );

        if (phoneCheck.rowCount > 0) {
            return res.status(400).json({ error: 'Этот номер телефона уже зарегистрирован для заказа.' });
        }

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

app.get('/api/products', async (req, res) => {
    try {
        const result = await client.query('SELECT id, name, price, image FROM products');
        res.json(result.rows); // Отправляем данные в формате JSON
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        res.status(500).send('Ошибка сервера');
    }
});



app.post('/api/questions', async (req, res) => {
    const { name, phone, question_text } = req.body;

    if (!name || !phone || !question_text) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    try {
        const result = await client.query(
            'INSERT INTO questions_from_form (name, phone, question_text) VALUES ($1, $2, $3) RETURNING id',
            [name, phone, question_text]
        );
        res.status(201).json({ message: 'Вопрос успешно сохранен', id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/api/check-order', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Номер телефона обязателен.' });
    }

    try {
        const orderQuery = `
            SELECT * FROM orders WHERE phone = $1 ORDER BY order_date DESC LIMIT 1
        `;
        const orderResult = await client.query(orderQuery, [phone]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Заказ не найден.' });
        }

        const order = orderResult.rows[0];
        const itemsQuery = `
            SELECT product_name, product_price, quantity
            FROM order_items WHERE order_id = $1
        `;
        const itemsResult = await client.query(itemsQuery, [order.id]);

        res.json({
            ...order,
            items: itemsResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера.' });
    }
});



// Запуск сервера
app.listen (port , () => {
    console.log(`Сервер запущен на http://localhost:${ port }`);
    }) ;  
