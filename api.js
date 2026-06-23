// ========== API КИНОПОИСКА (Фильмы и сериалы) ==========
const KINOPOISK_API_KEY = 'd0fa7c30-6035-4f8c-907b-0e7c81738ee3';
const KINOPOISK_API_URL = 'https://kinopoiskapiunofficial.tech/api';

// Функция поиска через API Кинопоиска
async function searchKinopoiskAPI(query) {
    if (!query || query.trim() === '') return [];
    
    try {
        const url = KINOPOISK_API_URL + '/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(query) + '&page=1';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('API ошибка Кинопоиска:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        if (data && data.films && data.films.length > 0) {
            return data.films.map(function(film) {
                return {
                    id: 'kp_' + film.filmId,
                    type: film.type === "TV_SERIES" ? "series" : "movie",
                    title: film.nameRu || film.nameEn || 'Без названия',
                    year: film.year,
                    rating: film.rating,
                    description: film.description || "Описание отсутствует",
                    image: film.posterUrl || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                    director: "—",
                    cast: "—",
                    duration: "—",
                    source: "Кинопоиск",
                    links: { watch: "https://www.kinopoisk.ru/film/" + film.filmId + "/" }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Ошибка API Кинопоиска:', error);
        return [];
    }
}

// Функция получения детальной информации о фильме по ID
async function getFilmDetails(filmId) {
    try {
        const url = KINOPOISK_API_URL + '/v2.2/films/' + filmId;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        return null;
    }
}

// ========== API ДЛЯ ИГР (IGDB / Twitch) ==========
// Для IGDB нужны Client-ID и Access Token
// Получить можно здесь: https://twitch.tv/console/apps
const IGDB_CLIENT_ID = ''; // Вставьте свой Client-ID
const IGDB_ACCESS_TOKEN = ''; // Вставьте свой Access Token

async function searchIGDB(query) {
    if (!query || query.trim() === '') return [];
    if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
        console.log('⚠️ IGDB API не настроен. Пропускаем поиск игр.');
        return [];
    }
    
    try {
        const url = 'https://api.igdb.com/v4/games';
        const searchQuery = 'search "' + query + '"; fields name,summary,first_release_date,cover.url,genres.name,platforms.name,rating,total_rating,involved_companies.company.name; limit 5;';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Client-ID': IGDB_CLIENT_ID,
                'Authorization': 'Bearer ' + IGDB_ACCESS_TOKEN,
                'Content-Type': 'text/plain'
            },
            body: searchQuery
        });
        
        if (!response.ok) {
            console.error('IGDB API ошибка:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            return data.map(function(game) {
                var imageUrl = game.cover?.url ? game.cover.url.replace('//', 'https://') : 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
                return {
                    id: 'igdb_' + game.id,
                    type: "game",
                    title: game.name,
                    year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
                    rating: game.rating ? (game.rating / 10).toFixed(1) : null,
                    description: game.summary ? game.summary.substring(0, 300) : "Описание отсутствует",
                    image: imageUrl,
                    developer: game.involved_companies?.[0]?.company?.name || "—",
                    platforms: game.platforms?.map(function(p) { return p.name; }).join(', ') || "—",
                    genre: game.genres?.map(function(g) { return g.name; }).join(', ') || "—",
                    source: "IGDB",
                    links: { buy: "https://www.google.com/search?q=" + encodeURIComponent(game.name) + "+купить" }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Ошибка IGDB API:', error);
        return [];
    }
}

// ========== API ДЛЯ КНИГ (Google Books) ==========
async function searchGoogleBooks(query) {
    if (!query || query.trim() === '') return [];
    
    try {
        // Используем CORS-прокси для обхода блокировок
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = 'https://www.googleapis.com/books/v1/volumes?q=' + encodeURIComponent(query) + '&maxResults=10';
        
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        const data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
            return data.items.map(function(book) {
                var volume = book.volumeInfo;
                var description = volume.description ? volume.description.replace(/<[^>]*>/g, '') : 'Описание отсутствует';
                return {
                    id: 'book_' + book.id,
                    type: "book",
                    title: volume.title || 'Без названия',
                    year: volume.publishedDate ? volume.publishedDate.split('-')[0] : null,
                    rating: volume.averageRating ? volume.averageRating.toFixed(1) : null,
                    description: description.substring(0, 300),
                    image: volume.imageLinks?.thumbnail || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                    author: volume.authors ? volume.authors.join(', ') : 'Автор не указан',
                    pages: volume.pageCount || "—",
                    source: "Google Books",
                    links: { buy: volume.infoLink || '#' }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Ошибка Google Books:', error);
        return [];
    }
}

// ========== УНИВЕРСАЛЬНЫЙ ПОИСК ==========
async function searchAllAPIs(query) {
    console.log('🔍 Поиск по запросу:', query);
    
    const movies = await searchKinopoiskAPI(query);
    const games = await searchIGDB(query);
    const books = await searchGoogleBooks(query);
    
    console.log('📊 Результаты: фильмы/сериалы - ' + movies.length + ', игры - ' + games.length + ', книги - ' + books.length);
    
    return [...movies, ...games, ...books];
}

console.log('✅ API модуль загружен');
console.log('📌 Кинопоиск API: ' + (KINOPOISK_API_KEY ? '✅ настроен' : '❌ не настроен'));
console.log('📌 IGDB API: ' + (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN ? '✅ настроен' : '❌ не настроен (опционально)'));
console.log('📌 Google Books API: ✅ настроен (без ключа)');
