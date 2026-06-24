// ============================================================
// ========== НАСТРОЙКА API КЛЮЧЕЙ ==========
// ============================================================

// 1. Кинопоиск
const KINOPOISK_API_KEY = 'd0fa7c30-6035-4f8c-907b-0e7c81738ee3';
const KINOPOISK_API_URL = 'https://kinopoiskapiunofficial.tech/api';

// 2. Google Books - ВАШ КЛЮЧ
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAjhurxN3r8j4MjEzFDW6fIBXkgKDZzbOs';

// 3. IGDB / Twitch (для игр) - опционально
const IGDB_CLIENT_ID = ''; // Вставьте Client-ID
const IGDB_ACCESS_TOKEN = ''; // Вставьте Access Token

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
// ========== GOOGLE BOOKS API (БЕЗ ПРОКСИ) ==========
// ============================================================

async function searchGoogleBooks(query) {
    if (!query || query.trim() === '') return [];
    
    console.log('📚 Поиск книг в Google Books:', query);
    
    try {
        // ПРЯМОЙ ЗАПРОС (без прокси)
        var apiUrl = 'https://www.googleapis.com/books/v1/volumes?q=' + 
                     encodeURIComponent(query) + 
                     '&maxResults=10' + 
                     '&orderBy=relevance' +
                     '&key=' + GOOGLE_BOOKS_API_KEY;
        
        console.log('📡 Запрос к Google Books');
        
        var response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error('Google Books API ошибка:', response.status);
            
            if (response.status === 403) {
                console.error('❌ Ошибка 403: Проверьте ключ API и настройки в Google Cloud Console.');
                console.error('   - Убедитесь, что Books API включен');
                console.error('   - Проверьте ограничения ключа');
            } else if (response.status === 429) {
                console.error('❌ Превышен лимит запросов. Подождите немного.');
            }
            
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
        
        console.log('❌ Книги не найдены');
        return [];
    } catch (error) {
        console.error('❌ Ошибка Google Books:', error.message);
        return [];
    }
}

// ============================================================
// ========== API ДЛЯ ИГР (IGDB) - опционально ==========
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
                return {
                    id: 'igdb_' + game.id,
                    type: "game",
                    title: game.name || 'Без названия',
                    year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
                    rating: game.rating ? (game.rating / 10).toFixed(1) : null,
                    description: game.summary ? game.summary.substring(0, 300) : "Описание отсутствует",
                    image: imageUrl,
                    developer: game.involved_companies?.[0]?.company?.name || "—",
                    platforms: game.platforms?.map(function(p) { return p.name; }).join(', ') || "—",
                    genre: game.genres?.map(function(g) { return g.name; }).join(', ') || "—",
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
    console.log('🔍 Универсальный поиск:', query);
    
    try {
        // Запускаем параллельно
        var [movies, books, games] = await Promise.all([
            searchKinopoiskAPI(query),
            searchGoogleBooks(query),
            searchIGDB(query)
        ]);
        
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
// ========== OPEN LIBRARY API (ДЛЯ КАРТИНОК) ==========
async function getBookCoverFromOpenLibrary(title, author) {
    try {
        var query = encodeURIComponent(title);
        if (author) {
            query += '+' + encodeURIComponent(author);
        }
        
        var url = 'https://openlibrary.org/search.json?q=' + query + '&limit=1';
        var response = await fetch(url);
        var data = await response.json();
        
        if (data && data.docs && data.docs.length > 0) {
            var coverId = data.docs[0].cover_i;
            if (coverId) {
                return {
                    url: 'https://covers.openlibrary.org/b/id/' + coverId + '-L.jpg',
                    id: coverId
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Ошибка Open Library:', error);
        return null;
    }
}

// Функция для обновления картинок в локальной базе
async function updateLocalBookCovers() {
    console.log('🔄 Обновление обложек книг...');
    var updated = 0;
    
    for (var i = 0; i < contentDatabase.length; i++) {
        var book = contentDatabase[i];
        if (book.type !== 'book') continue;
        
        // Пропускаем если уже есть нормальная картинка
        if (book.image && !book.image.includes('placeholder') && !book.image.includes('No+Image')) {
            continue;
        }
        
        try {
            var cover = await getBookCoverFromOpenLibrary(book.title, book.author);
            if (cover && cover.url) {
                book.image = cover.url;
                updated++;
                console.log('✅ Обновлена обложка для:', book.title);
            }
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
        
        // Задержка между запросами
        await new Promise(function(resolve) { setTimeout(resolve, 300); });
    }
    
    console.log('✅ Обновлено обложек:', updated);
    return updated;
}
// ============================================================
// ========== НОВОСТИ ИЗ RSS ==========
// ============================================================

async function fetchRSSFeed(url) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(url));
        
        if (!response.ok) {
            console.error('Ошибка загрузки RSS:', response.status);
            return null;
        }
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        const items = xml.querySelectorAll('item');
        const news = [];
        
        items.forEach(function(item) {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const category = item.querySelector('category')?.textContent || '';
            
            const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
            
            if (title) {
                news.push({
                    title: title.trim(),
                    description: cleanDescription.substring(0, 300) || 'Описание отсутствует',
                    url: link || '#',
                    date: pubDate ? new Date(pubDate).toLocaleString() : new Date().toLocaleString(),
                    category: category || 'Новости'
                });
            }
        });
        
        return news;
    } catch (error) {
        console.error('Ошибка парсинга RSS:', error);
        return null;
    }
}

async function fetchAllNewsFromRSS() {
    console.log('📰 Загрузка новостей из RSS...');
    const allNews = [];
    
    try {
        const sources = [
            'https://www.kinopoisk.ru/news/rss/',
            'https://www.film.ru/rss/news',
            'https://www.ign.com/rss/articles',
            'https://www.litres.ru/static/rss/news.xml',
            'https://www.rbc.ru/rss/culture/',
            'https://www.kommersant.ru/RSS/news-culture.xml'
        ];
        
        const promises = sources.map(function(source) {
            return fetchRSSFeed(source);
        });
        
        const results = await Promise.all(promises);
        
        results.forEach(function(newsList) {
            if (newsList && newsList.length > 0) {
                allNews.push.apply(allNews, newsList);
            }
        });
        
        // Удаляем дубликаты по заголовку
        const uniqueNews = [];
        const titles = {};
        
        allNews.forEach(function(news) {
            if (!titles[news.title]) {
                titles[news.title] = true;
                uniqueNews.push(news);
            }
        });
        
        // Сортируем по дате (сначала свежие)
        uniqueNews.sort(function(a, b) {
            var dateA = new Date(a.date);
            var dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        console.log('✅ Загружено новостей из RSS:', uniqueNews.length);
        return uniqueNews.slice(0, 30);
    } catch (error) {
        console.error('Ошибка загрузки RSS новостей:', error);
        return [];
    }
}

// ========== ОБНОВЛЕНИЕ НОВОСТЕЙ ==========
async function updateNewsDatabase() {
    console.log('🔄 Обновление новостей...');
    
    try {
        const news = await fetchAllNewsFromRSS();
        
        if (news && news.length > 0) {
            localStorage.setItem('seeker_news', JSON.stringify(news));
            console.log('✅ Новости обновлены, добавлено:', news.length);
            return news;
        }
        return [];
    } catch (error) {
        console.error('Ошибка обновления новостей:', error);
        return [];
    }
}

// Экспорт
window.fetchAllNewsFromRSS = fetchAllNewsFromRSS;
window.updateNewsDatabase = updateNewsDatabase;
// Экспорт
window.getBookCoverFromOpenLibrary = getBookCoverFromOpenLibrary;
window.updateLocalBookCovers = updateLocalBookCovers;

// ============================================================
// ========== ЭКСПОРТ ==========
// ============================================================

window.searchKinopoiskAPI = searchKinopoiskAPI;
window.searchGoogleBooks = searchGoogleBooks;
window.searchIGDB = searchIGDB;
window.searchAllAPIs = searchAllAPIs;

console.log('✅ API модуль загружен');
console.log('📌 Кинопоиск API: ✅ настроен');
console.log('📌 Google Books API: ' + (GOOGLE_BOOKS_API_KEY && GOOGLE_BOOKS_API_KEY.trim() !== '' ? '✅ настроен' : '❌ не настроен'));
console.log('📌 IGDB API: ' + (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN ? '✅ настроен' : '❌ не настроен'));
