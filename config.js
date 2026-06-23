// ============= ФАЙЛ КОНФИГУРАЦИИ С API КЛЮЧАМИ =============
// ⚠️ ВНИМАНИЕ: Этот файл НЕ загружать на GitHub!
// Добавьте js/config.js в .gitignore

const API_CONFIG = {
    // Кинопоиск API
    KINOPOISK_API_KEY: 'd0fa7c30-6035-4f8c-907b-0e7c81738ee3',
    
    // IGDB API (если есть)
    IGDB_CLIENT_ID: '',
    IGDB_ACCESS_TOKEN: '',
    
    // Google Books API - ключ не обязателен
    GOOGLE_BOOKS_API_KEY: ''  // Можно оставить пустым, API работает без ключа
};

// Проверка наличия ключей (для отладки)
console.log('🔑 API Конфигурация загружена');
console.log('   Кинопоиск API:', API_CONFIG.KINOPOISK_API_KEY ? '✓ установлен' : '✗ не установлен');
console.log('   IGDB API:', API_CONFIG.IGDB_CLIENT_ID && API_CONFIG.IGDB_ACCESS_TOKEN ? '✓ установлен' : '✗ не установлен');
console.log('   Google Books API:', '✓ доступен (без ключа)');