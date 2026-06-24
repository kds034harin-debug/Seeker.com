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

    // ========== СЕРИАЛЫ ==========
    { 
        id: 6, type: "series", title: "Ведьмак (Netflix)", year: "2019-2023", rating: "8.0",
        description: "Генри Кавилл в роли Геральта из Ривии. Экранизация культовой серии книг и игр.",
        image: "https://image.tmdb.org/t/p/w500/7vjaCdMw15BcXhrLhIErge1TFqd.jpg",
        creator: "Лорен Шмидт-Хиссрих", seasons: "3 сезона", episodes: "24 эпизода",
        links: { watch: "https://www.netflix.com/title/80189685" }
    },
    { 
        id: 7, type: "series", title: "Игра престолов", year: "2011-2019", rating: "9.2",
        description: "Эпическая сага о борьбе за Железный трон.",
        image: "https://image.tmdb.org/t/p/w500/7WUHnJGxMy8gCTlGKqVYpSJZXkF.jpg",
        creator: "Дэвид Бениофф, Д.Б. Вайс", seasons: "8 сезонов", episodes: "73 эпизода",
        links: { watch: "https://www.kinopoisk.ru/series/464348/" }
    },
    { 
        id: 8, type: "series", title: "The Last of Us (HBO)", year: "2023", rating: "9.1",
        description: "Экранизация культовой игры. В постапокалиптическом мире Джоэл и Элли путешествуют через развалины Америки.",
        image: "https://image.tmdb.org/t/p/w500/k9bb6UwO4pE2cRQgFJXqHVO8e4h.jpg",
        creator: "Крэйг Мейзин", seasons: "1 сезон", episodes: "9 эпизодов",
        links: { watch: "https://www.kinopoisk.ru/series/the-last-of-us-2023/" }
    },

    // ============================================================
    // ========== ИГРЫ ==========
    // ============================================================
    
    // === Ведьмак 1 ===
    { 
        id: 9001, type: "game", title: "Ведьмак", year: "2007", rating: "8.5",
        description: "Первая часть культовой RPG-серии. Геральт из Ривии отправляется на поиски похищенной возлюбленной.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/5/52/Wied%C5%BAmin_oblozhka.jpg/200px-Wied%C5%BAmin_oblozhka.jpg",
        developer: "CD Projekt RED", platforms: "PC", genre: "RPG, Action",
        links: { buy: "https://store.steampowered.com/app/20900/The_Witcher_Enhanced_Edition_Directors_Cut/" }
    },
    // === Ведьмак 2 ===
    { 
        id: 9002, type: "game", title: "Ведьмак 2: Убийцы королей", year: "2011", rating: "8.9",
        description: "Продолжение приключений Геральта. Сюжет разворачивается вокруг убийства короля и политических интриг.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/2/28/Wied%C5%BAmin_2_oblozhka.jpg/200px-Wied%C5%BAmin_2_oblozhka.jpg",
        developer: "CD Projekt RED", platforms: "PC, Xbox 360", genre: "RPG, Action",
        links: { buy: "https://store.steampowered.com/app/20920/The_Witcher_2_Assassins_of_Kings_Enhanced_Edition/" }
    },
    // === Ведьмак 3 ===
    { 
        id: 9, type: "game", title: "Ведьмак 3: Дикая Охота", year: "2015", rating: "9.6",
        description: "Легендарная RPG от CD Projekt RED. Завершающая часть трилогии о Геральте из Ривии.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/0/0c/Wied%C5%BAmin_3_Dziki_Gon.jpg/200px-Wied%C5%BAmin_3_Dziki_Gon.jpg",
        developer: "CD Projekt RED", platforms: "PC, PS5, Xbox, Switch", genre: "RPG, Action",
        links: { buy: "https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/" }
    },
    // === Cyberpunk 2077 ===
    { 
        id: 10, type: "game", title: "Cyberpunk 2077", year: "2020", rating: "8.2",
        description: "Приключения наёмника Ви в Найт-Сити. Сюжетная RPG в мире киберпанка от создателей Ведьмака.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/9/98/Cyberpunk_2077_cover.jpg/200px-Cyberpunk_2077_cover.jpg",
        developer: "CD Projekt RED", platforms: "PC, PS5, Xbox", genre: "Киберпанк, RPG",
        links: { buy: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/" }
    },
    // === The Last of Us Part I ===
    { 
        id: 11, type: "game", title: "The Last of Us Part I", year: "2022", rating: "9.5",
        description: "Ремастер культовой игры о выживании в постапокалиптическом мире.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/8/83/The_Last_of_Us_Part_I_cover.jpg/200px-The_Last_of_Us_Part_I_cover.jpg",
        developer: "Naughty Dog", platforms: "PC, PS5", genre: "Action-adventure",
        links: { buy: "https://store.steampowered.com/app/1888930/The_Last_of_Us_Part_I/" }
    },
    // === The Last of Us Part II ===
    { 
        id: 9003, type: "game", title: "The Last of Us Part II", year: "2020", rating: "9.3",
        description: "Продолжение культовой игры. История мести и прощения.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/4/4d/The_Last_of_Us_Part_II_cover.jpg/200px-The_Last_of_Us_Part_II_cover.jpg",
        developer: "Naughty Dog", platforms: "PS4, PS5, PC", genre: "Action-adventure",
        links: { buy: "https://store.playstation.com/ru-ru/product/UP9000-CUSA07820_00-THELASTOFUS2DIG0" }
    },
    // === Red Dead Redemption 2 ===
    { 
        id: 9004, type: "game", title: "Red Dead Redemption 2", year: "2018", rating: "9.8",
        description: "Эпическая история о жизни Артура Моргана и банды Датча Ван дер Линде в Америке конца XIX века.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/4/4e/Red_Dead_Redemption_2_cover.jpg/200px-Red_Dead_Redemption_2_cover.jpg",
        developer: "Rockstar Games", platforms: "PC, PS5, Xbox", genre: "Action-adventure, Open World",
        links: { buy: "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/" }
    },
    // === God of War (2018) ===
    { 
        id: 9005, type: "game", title: "God of War", year: "2018", rating: "9.7",
        description: "Кратос и его сын Атрей отправляются в путешествие по скандинавской мифологии.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/7/75/God_of_War_2018_cover.jpg/200px-God_of_War_2018_cover.jpg",
        developer: "Santa Monica Studio", platforms: "PC, PS5, PS4", genre: "Action-adventure",
        links: { buy: "https://store.steampowered.com/app/1593500/God_of_War/" }
    },
    // === Elden Ring ===
    { 
        id: 9006, type: "game", title: "Elden Ring", year: "2022", rating: "9.8",
        description: "Мастерская RPG от создателей Dark Souls и Джорджа Р.Р. Мартина. Открытый мир, полный опасностей и тайн.",
        image: "https://upload.wikimedia.org/wikipedia/ru/thumb/9/98/Elden_Ring_cover.jpg/200px-Elden_Ring_cover.jpg",
        developer: "FromSoftware", platforms: "PC, PS5, Xbox", genre: "RPG, Action, Souls-like",
        links: { buy: "https://store.steampowered.com/app/1245620/ELDEN_RING/" }
    },

    // ========== КНИГИ ==========
    { 
        id: 12, type: "book", title: "Ведьмак. Последнее желание", year: "1993", rating: "8.9",
        description: "Первый сборник рассказов Анджея Сапковского о ведьмаке Геральте из Ривии.",
        image: "https://covers.openlibrary.org/b/id/8221506-L.jpg",
        author: "Анджей Сапковский", pages: "288",
        links: { buy: "https://www.litres.ru/andzhey-sapkovskiy/poslednee-zhelanie/" }
    },
    { 
        id: 13, type: "book", title: "Дюна", year: "1965", rating: "9.2",
        description: "Шедевр научной фантастики Фрэнка Герберта о пустынной планете Арракис.",
        image: "https://covers.openlibrary.org/b/id/10781358-L.jpg",
        author: "Фрэнк Герберт", pages: "412",
        links: { buy: "https://www.litres.ru/frenk-gerbert/duna/" }
    },
    { 
        id: 14, type: "book", title: "1984", year: "1949", rating: "9.0",
        description: "Классический роман-антиутопия Джорджа Оруэлла о тоталитарном обществе.",
        image: "https://covers.openlibrary.org/b/id/10781359-L.jpg",
        author: "Джордж Оруэлл", pages: "328",
        links: { buy: "https://www.litres.ru/dzhordzh-oruell/1984/" }
    },
    { 
        id: 15, type: "book", title: "Гарри Поттер и философский камень", year: "1997", rating: "9.0",
        description: "Начало магической саги о мальчике-волшебнике Гарри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8221507-L.jpg",
        author: "Джоан Роулинг", pages: "332",
        links: { buy: "https://www.litres.ru/dzhoan-rouling/garri-potter-i-filosofskiy-kamen/" }
    }
];

console.log('✅ База данных загружена, количество записей:', contentDatabase.length);
