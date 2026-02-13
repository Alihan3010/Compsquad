// ========================================
// ПРИМЕР ИНТЕГРАЦИИ С БЕЗОПАСНЫМ СЕРВЕРОМ
// ========================================
// Скопируйте эту функцию в существующий script.js
// чтобы использовать свой сервер вместо прямого обращения к OpenAI

/**
 * ВАРИАНТ 1: Использование собственного Node.js сервера
 * Замените в script.js функцию callOpenAIAPI на эту:
 */

async function callOpenAIAPI_Safe(systemPrompt, userMessage) {
    // ВАЖНО: Убедитесь, что сервер запущен на указанном адресе
    const SERVER_URL = 'http://localhost:3000'; // Измените на ваш адрес

    try {
        const response = await fetch(`${SERVER_URL}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: userMessage,
                context: systemPrompt
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Server error');
        }

        const data = await response.json();
        return data.result;

    } catch (error) {
        console.error('Ошибка при обращении к серверу:', error);
        return getDemoResponse(userMessage);
    }
}

/**
 * ВАРИАНТ 2: Использование Python Flask сервера
 */

// Пример Python кода (app.py):

/*
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/api/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query')
    context = data.get('context')

    if not query or len(query.strip()) == 0:
        return jsonify({'error': 'Пустой запрос'}), 400

    try:
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[
                {'role': 'system', 'content': context},
                {'role': 'user', 'content': query}
            ],
            temperature=0.7,
            max_tokens=800
        )

        result = response['choices'][0]['message']['content']
        return jsonify({'success': True, 'result': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
*/

/**
 * ВАРИАНТ 3: Использование Vercel или Netlify Functions
 */

// Пример для Vercel (api/search.js):

/*
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, context } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();
    res.json({ success: true, result: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
*/

/**
 * ШАГИ ИНТЕГРАЦИИ:
 * 
 * 1. УСТАНОВКА (выберите один вариант):
 *    
 *    Вариант 1 - Node.js:
 *    $ npm init -y
 *    $ npm install express dotenv axios cors
 *    $ node server.js
 *    
 *    Вариант 2 - Python:
 *    $ pip install flask flask-cors python-dotenv openai
 *    $ python app.py
 *    
 *    Вариант 3 - Vercel:
 *    $ npm i -g vercel
 *    $ vercel  (деплой на Vercel)
 * 
 * 2. СОЗДАНИЕ .env файла:
 *    Copy .env.example to .env
 *    Заполните OPENAI_API_KEY
 * 
 * 3. ОБНОВЛЕНИЕ ФРОНТЕНДА:
 *    Замените callOpenAIAPI на callOpenAIAPI_Safe в script.js
 *    Убедитесь, что SERVER_URL указывает на ваш сервер
 * 
 * 4. РАЗВЕРТЫВАНИЕ:
 *    - Локально: npm start
 *    - На облако: Heroku, Railway, Render и.т.д.
 */

/**
 * БЕЗОПАСНОСТЬ:
 * 
 * ✅ ДЛЯ ПРОДАКШЕНА:
 * - НИКОГДА не публикуйте API ключи в коде
 * - Используйте переменные окружения (.env файл в .gitignore)
 * - Включите HTTPS
 * - Добавьте rate limiting
 * - Используйте аутентификацию
 * - Логируйте все запросы
 * 
 * ❌ НЕ ДЕЛАЙТЕ:
 * - Не встраивайте API ключ вHTML/JS
 * - Не коммитьте .env в Git
 * - Не передавайте ключ в URL параметрах
 * - Не логируйте чувствительные данные
 */

/**
 * КРОСС-ДОМЕННЫЕ ЗАПРОСЫ (CORS):
 * 
 * Если получаете CORS ошибку:
 * 1. Убедитесь, что сервер настроен на CORS
 * 2. Используйте правильный адрес сервера
 * 3. В Production используйте HTTPS
 * 
 * Пример CORS конфига:
 */

/*
const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
*/

/**
 * МОНИТОРИНГ И ЛОГИРОВАНИЕ:
 */

/*
const logger = {
    info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`)
};

app.post('/api/search', async (req, res) => {
    logger.info(`Search query: ${req.body.query}`);
    // ... остальной код
});
*/

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ИНТЕГРАЦИЯ БЕЗ API КЛЮЧА В ФРОНТЕНДЕ ЗАВЕРШЕНА              ║
║                                                               ║
║  Используйте одно из трех решений выше для безопасности      ║
╚══════════════════════════════════════════════════════════════╝
`);
