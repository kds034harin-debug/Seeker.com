// ============================================================
// ========== НАСТРОЙКА API КЛЮЧЕЙ ==========
// ============================================================

// 1. Кинопоиск
const KINOPOISK_API_KEY = 'd0fa7c30-6035-4f8c-907b-0e7c81738ee3';
const KINOPOISK_API_URL = 'https://kinopoiskapiunofficial.tech/api';

// 2. Google Books - ВАШ КЛЮЧ
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAjhurxN3r8j4MjEzFDW6fIBXkgKDZzbOs';

// 3. IGDB / Twitch (для игр)
const IGDB_CLIENT_ID = ''; // Вставьте Client-ID
const IGDB_ACCESS_TOKEN = ''; // Вставьте Access Token

// ============================================================
// ========== НАСТРОЙКИ ПРОИЗВОДИТЕЛЬНОСТИ ==========
// ============================================================

const MAX_PAGES = 2; // Уменьшено с 5 до 2 для скорости
const FILMS_PER_PAGE = 10;

// ============================================================
// ========== API КИНОПОИСКА ==========
// ============================================================

async function searchKinopoiskAPI(query) {
    if (!query || query.trim() === '') return [];

    console.log('🔍 Поиск на Кинопоиске:', query);
    
    try {
        var url = KINOPOISK_API_URL + 
            '/v2.1/films/search-by-keyword?keyword=' + 
            encodeURIComponent(query) + 
            '&page=1';

        var response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': KINOPOISK_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('API ошибка:', response.status);
            return [];
        }

        var data = await response.json();
        
        if (!data.films || data.films.length === 0) {
            console.log('❌ Ничего не найдено');
            return [];
        }

        var allFilms = data.films.map(function(film) {
            return {
                id: 'kp_' + film.filmId,
                type: film.type === "TV_SERIES" ? "series" : "movie",
                title: film.nameRu || film.nameEn || 'Без названия',
                year: film.year,
                rating: film.rating,
                description: film.description || "Описание отсутствует",
                image: film.posterUrl || 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image',
                source: "Кинопоиск",
                links: { watch: "https://www.kinopoisk.ru/film/" + film.filmId + "/" }
            };
        });

        console.log('✅ Загружено фильмов:', allFilms.length);
        return allFilms;

    } catch (error) {
        console.error('Ошибка API Кинопоиска:', error);
        return [];
    }
}

// ============================================================
// ========== GOOGLE BOOKS API ==========
// ============================================================

async function searchGoogleBooks(query) {
    if (!query || query.trim() === '') return [];
    
    console.log('📚 Поиск книг в Google Books:', query);
    
    try {
        var apiUrl = 'https://www.googleapis.com/books/v1/volumes?q=' + 
                     encodeURIComponent(query) + 
                     '&maxResults=10' + 
                     '&orderBy=relevance' +
                     '&key=' + GOOGLE_BOOKS_API_KEY;
        
        var response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error('Google Books API ошибка:', response.status);
            return [];
        }
        
        var data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
            console.log('✅ Найдено книг:', data.items.length);
            
            return data.items.map(function(book) {
                var volume = book.volumeInfo || {};
                var description = volume.description ? volume.description.replace(/<[^>]*>/g, '') : 'Описание отсутствует';
                
                var imageUrl = 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
                if (volume.imageLinks) {
                    imageUrl = volume.imageLinks.thumbnail || 
                               volume.imageLinks.smallThumbnail || 
                               imageUrl;
                    imageUrl = imageUrl.replace('http://', 'https://');
                }
                
                return {
                    id: 'book_' + book.id,
                    type: "book",
                    title: volume.title || 'Без названия',
                    year: volume.publishedDate ? volume.publishedDate.split('-')[0] : null,
                    rating: volume.averageRating ? volume.averageRating.toFixed(1) : null,
                    description: description.substring(0, 350),
                    image: imageUrl,
                    author: volume.authors ? volume.authors.join(', ') : 'Автор не указан',
                    pages: volume.pageCount || "—",
                    source: "Google Books",
                    links: { buy: volume.infoLink || '#' }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('❌ Ошибка Google Books:', error);
        return [];
    }
}

// ============================================================
// ========== API ДЛЯ ИГР (IGDB) ==========
// ============================================================

async function searchIGDB(query) {
    if (!query || query.trim() === '') return [];
    if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
        return [];
    }
    
    try {
        var url = 'https://api.igdb.com/v4/games';
        var searchQuery = 'search "' + query + '"; fields name,summary,first_release_date,cover.url,genres.name,platforms.name,rating,total_rating,involved_companies.company.name; limit 5;';
        
        var response = await fetch(url, {
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
        
        var data = await response.json();
        
        if (data && data.length > 0) {
            return data.map(function(game) {
                var imageUrl = game.cover && game.cover.url ? game.cover.url.replace('//', 'https://') : 'https://placehold.co/90x130/f0f0f0/aaa?text=No+Image';
                var rating = game.rating ? (game.rating / 10).toFixed(1) : null;
                var platforms = game.platforms ? game.platforms.map(function(p) { return p.name; }).join(', ') : "—";
                var genres = game.genres ? game.genres.map(function(g) { return g.name; }).join(', ') : "—";
                var developer = game.involved_companies && game.involved_companies[0] && game.involved_companies[0].company ? game.involved_companies[0].company.name : "—";
                
                return {
                    id: 'igdb_' + game.id,
                    type: "game",
                    title: game.name || 'Без названия',
                    year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
                    rating: rating,
                    description: game.summary ? game.summary.substring(0, 300) : "Описание отсутствует",
                    image: imageUrl,
                    developer: developer,
                    platforms: platforms,
                    genre: genres,
                    source: "IGDB",
                    links: { buy: "https://www.google.com/search?q=" + encodeURIComponent(game.name || '') + "+купить" }
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Ошибка IGDB API:', error);
        return [];
    }
}

// ============================================================
// ========== УНИВЕРСАЛЬНЫЙ ПОИСК ==========
// ============================================================

async function searchAllAPIs(query) {
    console.log('🔍 Поиск:', query);
    
    try {
        // Запускаем параллельно для скорости
        var [movies, books] = await Promise.all([
            searchKinopoiskAPI(query),
            searchGoogleBooks(query)
        ]);
        
        // Игры загружаем отдельно (если есть ключи)
        var games = [];
        if (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN) {
            games = await searchIGDB(query);
        }
        
        var allResults = movies.concat(games).concat(books);
        
        console.log('📊 Результаты:');
        console.log('   🎬 Фильмы/сериалы:', movies.length);
        console.log('   🎮 Игры:', games.length);
        console.log('   📚 Книги:', books.length);
        console.log('   📌 Всего:', allResults.length);
        
        return allResults;
    } catch (error) {
        console.error('❌ Ошибка при поиске:', error);
        return [];
    }
}

// ============================================================
// ========== ЭКСПОРТ ==========
// ============================================================

window.searchKinopoiskAPI = searchKinopoiskAPI;
window.searchGoogleBooks = searchGoogleBooks;
window.searchIGDB = searchIGDB;
window.searchAllAPIs = searchAllAPIs;

console.log('✅ API модуль загружен');
console.log('📌 Кинопоиск API: ✅ настроен');
console.log('📌 Google Books API: ✅ настроен');
console.log('📌 IGDB API: ' + (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN ? '✅ настроен' : '❌ не настроен'));
