// ========================================
// ПРИМЕР СЕРВЕРНОЙ ЧАСТИ (Node.js + Express)
// ДЛЯ БЕЗОПАСНОЙ РАБОТЫ С OpenAI API
// ========================================

// УСТАНОВКА:
// npm init -y
// npm install express dotenv axios cors

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ========================================
// API МАРШРУТЫ
// ========================================

/**
 * POST /api/search
 * Безопасный эндпоинт для поиска через ChatGPT
 * 
 * Body:
 * {
 *   "query": "Озеро Зайсан",
 *   "context": "вся информация о базах отдыха"
 * }
 */
app.post('/api/search', async (req, res) => {
    try {
        const { query, context } = req.body;

        // Проверка на пустой запрос
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Запрос не может быть пустым'
            });
        }

        // Проверка на ВКО
        if (!isVKOQuery(query)) {
            return res.status(400).json({
                error: 'Поиск работает только по туризму в ВКО'
            });
        }

        // Отправка запроса к OpenAI
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `Ты - эксперт по туризму в ВКО. Помогаешь найти информацию о базах отдыха.\n\n${context || ''}`
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data.choices[0].message.content;

        res.json({
            success: true,
            result: result,
            query: query
        });

    } catch (error) {
        console.error('Ошибка при обращении к OpenAI:', error.message);

        res.status(500).json({
            error: 'Ошибка при обработке запроса',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/resorts
 * Получить все базы отдыха
 */
app.get('/api/resorts', (req, res) => {
    const resorts = [
        {
            id: 1,
            name: 'Озеро Зайсан - Туристический комплекс',
            type: 'Курортный комплекс',
            location: 'Озеро Зайсан, Абайская область',
            lat: 47.48,
            lng: 82.60,
            description: 'Туристический комплекс на берегу озера Зайсан',
            water: 'Озеро Зайсан',
            services: ['Гостиница', 'Ресторан', 'Водный спорт', 'Рыбалка'],
            season: 'Май - Сентябрь'
        },
        // ... остальные базы
    ];

    res.json({
        success: true,
        resorts: resorts,
        count: resorts.length
    });
});

/**
 * POST /api/resorts
 * Добавить новую базу отдыха (требует аутентификацию)
 */
app.post('/api/resorts', authenticateAdmin, (req, res) => {
    try {
        const { name, type, location, lat, lng, description, water, services, season } = req.body;

        // Валидация данных
        if (!name || !location || typeof lat !== 'number' || typeof lng !== 'number') {
            return res.status(400).json({
                error: 'Неполные данные базы отдыха'
            });
        }

        const newResort = {
            id: Date.now(),
            name,
            type,
            location,
            lat,
            lng,
            description,
            water,
            services: services || [],
            season
        };

        // Сохранение в БД (в реальном случае это была бы база данных)
        // db.resorts.insert(newResort);

        res.status(201).json({
            success: true,
            resort: newResort,
            message: 'База отдыха успешно добавлена'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при добавлении базы отдыха'
        });
    }
});

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

/**
 * Проверка, что запрос касается ВКО
 */
function isVKOQuery(query) {
    const vkoKeywords = [
        'вко', 'восточно-казахстанск', 'восточный казахстан',
        'зайсан', 'иртыш', 'семей', 'усть-каменогорск'
    ];

    const queryLower = query.toLowerCase();
    const hasVKOKeyword = vkoKeywords.some(keyword => queryLower.includes(keyword));

    if (!hasVKOKeyword) {
        return false;
    }

    const otherCountries = [
        'россия', 'москва', 'байкал', 'сочи', 'крым',
        'турция', 'египет', 'таиланд', 'мальдив'
    ];
    const hasOtherCountry = otherCountries.some(country => queryLower.includes(country));

    return !hasOtherCountry;
}

/**
 * Middleware для аутентификации администратора
 */
function authenticateAdmin(req, res, next) {
    const adminToken = req.headers['x-admin-token'];

    if (adminToken === process.env.ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({
            error: 'Неавторизованный доступ'
        });
    }
}

// ========================================
// ОБРАБОТЧИКИ ОШИБОК
// ========================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Маршрут не найден'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера'
    });
});

// ========================================
// ЗАПУСК СЕРВЕРА
// ========================================

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Эндпоинты:`);
    console.log(`  POST /api/search`);
    console.log(`  GET  /api/resorts`);
    console.log(`  POST /api/resorts (требует админ токен)`);
});

module.exports = app;
