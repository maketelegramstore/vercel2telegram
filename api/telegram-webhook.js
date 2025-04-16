// Файл: api/telegram-webhook.js
// Подходит для Vercel Node.js Runtime (или любой среды Node.js >= 18)

export default async function handler(req, res) {
  // URL вашего Google Apps Script веб-приложения из переменных окружения
  const GAS_URL = process.env.GAS_URL;

  // 1. Проверяем метод запроса
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // 2. Проверяем наличие GAS_URL
  if (!GAS_URL) {
    // Логируем ошибку на сервере, но отвечаем Telegram OK, чтобы он не повторял запрос
    console.error("Ошибка: Переменная окружения GAS_URL не установлена!");
    res.status(200).send('OK'); // Отвечаем OK
    return;
  }

  // 3. Получаем тело запроса
  // Vercel для Node.js runtime обычно автоматически парсит JSON тело в req.body
  const requestBody = req.body;

  // Если тело пустое или не распарсилось (на всякий случай)
  if (!requestBody) {
     console.error("Тело запроса пустое или не удалось его распарсить.");
     res.status(200).send('OK'); // Отвечаем OK
     return;
  }


  // 4. Запускаем пересылку данных в GAS *без* ожидания завершения
  // Используем fetch, который доступен глобально в Node.js 18+
  // Не используем await, чтобы не блокировать ответ для Telegram
  fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody), // Отправляем тело исходного запроса
  })
  .then(response => {
    // Опционально: Логируем результат пересылки, если нужно для отладки
    if (!response.ok) {
      console.error(`Ошибка при пересылке в GAS: Статус ${response.status} ${response.statusText}`);
      // Можно добавить логирование тела ответа от GAS при ошибке
      // response.text().then(text => console.error("Ответ от GAS:", text));
    } else {
      // console.log(`Пересылка в GAS успешна: Статус ${response.status}`); // Лог успеха (можно раскомментировать)
    }
  })
  .catch(error => {
    // Логируем ошибку самой операции fetch (например, проблема с сетью)
    console.error('Ошибка сети при пересылке данных в GAS:', error);
    // Здесь можно добавить логику для мониторинга ошибок
  });

  // 5. Немедленно возвращаем ответ 200 OK для Telegram
  res.status(200).send('OK');
}
