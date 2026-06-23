// Глобальная база данных контента
let contentDatabase = [
    // ========== ФИЛЬМЫ ==========
    { 
        id: 1, type: "movie", title: "Дюна: Часть вторая", year: "2024", rating: "8.9",
        description: "Эпическая научная фантастика Дени Вильнёва. Пол Атрейдес продолжает свой путь по Арракису.",
        image: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dnbOE6PYpEGBgT.jpg",
        director: "Дени Вильнёв", cast: "Тимоти Шаламе, Зендея", duration: "166 мин",
        links: { watch: "https://www.kinopoisk.ru/film/dyuna-chast-vtoraya-2024/" }
    },
    { 
        id: 2, type: "movie", title: "Интерстеллар", year: "2014", rating: "9.3",
        description: "Путешествие сквозь червоточину, любовь и спасение человечества.",
        image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        director: "Кристофер Нолан", cast: "Мэттью МакКонахи, Энн Хэтэуэй", duration: "169 мин",
        links: { watch: "https://www.kinopoisk.ru/film/interstellar/" }
    },
    { 
        id: 3, type: "movie", title: "Оппенгеймер", year: "2023", rating: "8.5",
        description: "История создателя атомной бомбы Роберта Оппенгеймера.",
        image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        director: "Кристофер Нолан", cast: "Киллиан Мёрфи, Мэтт Деймон", duration: "180 мин",
        links: { watch: "https://www.kinopoisk.ru/film/oppenheimer-2023/" }
    },
    { 
        id: 4, type: "movie", title: "Джон Уик 4", year: "2023", rating: "8.2",
        description: "Легендарный киллер продолжает борьбу с Правлением.",
        image: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        director: "Чад Стахелски", cast: "Киану Ривз, Донни Йен", duration: "169 мин",
        links: { watch: "https://www.kinopoisk.ru/film/john-wick-4/" }
    },
    { 
        id: 5, type: "movie", title: "Барби", year: "2023", rating: "7.8",
        description: "Фэнтезийная комедия о культовой кукле.",
        image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        director: "Грета Гервиг", cast: "Марго Робби, Райан Гослинг", duration: "114 мин",
        links: { watch: "https://www.kinopoisk.ru/film/barbie/" }
    },
    { 
        id: 16, type: "movie", title: "Ведьмак: Кошмар волка", year: "2021", rating: "7.4",
        description: "Анимационный фильм-приквел к сериалу 'Ведьмак'.",
        image: "https://image.tmdb.org/t/p/w500/7vjaCdMw15BcXhrLhIErge1TFqd.jpg",
        director: "Кванг Ил Хан", cast: "Тео Джеймс, Лара Пулвер", duration: "83 мин",
        links: { watch: "https://www.netflix.com/title/81435651" }
    },

    // ========== СЕРИАЛЫ ==========
    { 
        id: 6, type: "series", title: "Ведьмак (Netflix)", year: "2019-2023", rating: "8.0",
        description: "Генри Кавилл в роли Геральта из Ривии
