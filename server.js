const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, "users.sqlite");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(__dirname));

// --- SQLite helpers ------------------------------------------------------
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("Не удалось открыть БД:", err);
  }
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    (err) => {
      if (err) console.error("Не удалось создать таблицу users:", err);
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS tours (
      tour_id TEXT PRIMARY KEY,
      tour_name TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      max_participants INTEGER,
      location TEXT,
      season TEXT,
      days INTEGER,
      difficulty TEXT,
      price INTEGER,
      image TEXT
    )`,
    (err) => {
      if (err) console.error("Не удалось создать таблицу tours:", err);
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS mountains (
      mountain_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT,
      height INTEGER
    )`,
    (err) => {
      if (err) console.error("Не удалось создать таблицу mountains:", err);
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS tour_mountains (
      tour_id TEXT NOT NULL,
      mountain_id TEXT NOT NULL,
      PRIMARY KEY (tour_id, mountain_id),
      FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE,
      FOREIGN KEY (mountain_id) REFERENCES mountains(mountain_id) ON DELETE CASCADE
    )`,
    (err) => {
      if (err) console.error("Не удалось создать таблицу tour_mountains:", err);
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS tickets (
      ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      tour_id TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE
    )`,
    (err) => {
      if (err) console.error("Не удалось создать таблицу tickets:", err);
    }
  );
});

// --- seed data for tours and mountains -----------------------------------
const seedTours = [
  {
    tour_id: "elbrus-classic",
    tour_name: "Эльбрус Классик",
    description: "Восхождение с опытным гидом, мягкий темп и красивейшие виды.",
    start_date: "2025-07-05",
    end_date: "2025-07-11",
    max_participants: 8,
    location: "Кавказ, Эльбрус",
    season: "Июль",
    days: 6,
    difficulty: "Средний",
    price: 52000,
    image: "image/popular_tour1.png"
  },
  {
    tour_id: "kilimanjaro",
    tour_name: "Килиманджаро Лайт",
    description: "Маршрут Мачаме, портеры, повар и усиленная акклиматизация.",
    start_date: "2025-08-10",
    end_date: "2025-08-18",
    max_participants: 10,
    location: "Танзания, Килиманджаро",
    season: "Август",
    days: 8,
    difficulty: "Продвинутый",
    price: 138000,
    image: "image/popular_tour2.png"
  },
  {
    tour_id: "altai",
    tour_name: "Алтай. Долина озёр",
    description: "Маршрут без сложных перевалов, для первого знакомства с горами.",
    start_date: "2025-06-01",
    end_date: "2025-06-06",
    max_participants: 12,
    location: "Россия, Алтай",
    season: "Июнь",
    days: 5,
    difficulty: "Лёгкий",
    price: 39000,
    image: "image/popular_tour3.png"
  },
  {
    tour_id: "nepal",
    tour_name: "Эверест трек",
    description: "Классический трек к базовому лагерю Эвереста с лоджиями.",
    start_date: "2025-10-03",
    end_date: "2025-10-15",
    max_participants: 12,
    location: "Непал, Сагарматха",
    season: "Октябрь",
    days: 12,
    difficulty: "Продвинутый",
    price: 165000,
    image: "image/Rectangle 10.png"
  },
  {
    tour_id: "georgia",
    tour_name: "Сванетия и Ушба",
    description: "Трекинг между сванскими башнями, сыры, вино и вид на Ушбу.",
    start_date: "2025-09-05",
    end_date: "2025-09-12",
    max_participants: 14,
    location: "Грузия, Сванетия",
    season: "Сентябрь",
    days: 7,
    difficulty: "Средний",
    price: 67000,
    image: "image/Rectangle 11.png"
  },
  {
    tour_id: "kamchatka",
    tour_name: "Камчатка. Вулканы",
    description: "Толбачик, вулканические поля, горячие источники и медведи.",
    start_date: "2025-07-15",
    end_date: "2025-07-23",
    max_participants: 10,
    location: "Россия, Камчатка",
    season: "Июль",
    days: 9,
    difficulty: "Средний",
    price: 92000,
    image: "image/Rectangle 9.png"
  }
];

const seedMountains = [
  { mountain_id: "elbrus", name: "Эльбрус", region: "Кавказ", height: 5642 },
  { mountain_id: "kilimanjaro", name: "Килиманджаро", region: "Танзания", height: 5895 },
  { mountain_id: "aktru", name: "Актру", region: "Алтай", height: 4044 },
  { mountain_id: "everest", name: "Джомолунгма", region: "Гималаи", height: 8848 },
  { mountain_id: "ushba", name: "Ушба", region: "Сванетия", height: 4710 },
  { mountain_id: "tolbachik", name: "Толбачик", region: "Камчатка", height: 3682 }
];

const seedTourMountains = [
  { tour_id: "elbrus-classic", mountain_id: "elbrus" },
  { tour_id: "kilimanjaro", mountain_id: "kilimanjaro" },
  { tour_id: "altai", mountain_id: "aktru" },
  { tour_id: "nepal", mountain_id: "everest" },
  { tour_id: "georgia", mountain_id: "ushba" },
  { tour_id: "kamchatka", mountain_id: "tolbachik" }
];

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function seedData() {
  try {
    const tourCount = await dbGet("SELECT COUNT(*) as c FROM tours");
    if (!tourCount || tourCount.c === 0) {
      const insertTour = db.prepare(
        "INSERT INTO tours (tour_id, tour_name, description, start_date, end_date, max_participants, location, season, days, difficulty, price, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      seedTours.forEach((tour) => {
        insertTour.run([
          tour.tour_id,
          tour.tour_name,
          tour.description,
          tour.start_date,
          tour.end_date,
          tour.max_participants,
          tour.location,
          tour.season,
          tour.days,
          tour.difficulty,
          tour.price,
          tour.image
        ]);
      });
      insertTour.finalize();
      console.log("Таблица tours заполнена начальными данными");
    }

    const mountainCount = await dbGet("SELECT COUNT(*) as c FROM mountains");
    if (!mountainCount || mountainCount.c === 0) {
      const insertMountain = db.prepare("INSERT INTO mountains (mountain_id, name, region, height) VALUES (?, ?, ?, ?)");
      seedMountains.forEach((m) => insertMountain.run([m.mountain_id, m.name, m.region, m.height]));
      insertMountain.finalize();
      console.log("Таблица mountains заполнена начальными данными");
    }

    const linkCount = await dbGet("SELECT COUNT(*) as c FROM tour_mountains");
    if (!linkCount || linkCount.c === 0) {
      const insertLink = db.prepare("INSERT OR IGNORE INTO tour_mountains (tour_id, mountain_id) VALUES (?, ?)");
      seedTourMountains.forEach((link) => insertLink.run([link.tour_id, link.mountain_id]));
      insertLink.finalize();
      console.log("Таблица tour_mountains заполнена начальными данными");
    }
  } catch (err) {
    console.error("Ошибка при заполнении БД начальными данными:", err);
  }
}

seedData();

function mapToursWithMountains(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    if (!grouped.has(row.tour_id)) {
      grouped.set(row.tour_id, {
        id: row.tour_id,
        name: row.tour_name,
        description: row.description,
        startDate: row.start_date,
        endDate: row.end_date,
        maxParticipants: row.max_participants,
        location: row.location,
        season: row.season,
        days: row.days,
        difficulty: row.difficulty,
        price: row.price,
        image: row.image,
        mountains: []
      });
    }
    if (row.mountain_id) {
      grouped.get(row.tour_id).mountains.push({
        id: row.mountain_id,
        name: row.mountain_name,
        region: row.mountain_region,
        height: row.mountain_height
      });
    }
  });
  return Array.from(grouped.values());
}

// --- Routes --------------------------------------------------------------
app.post("/api/auth", async (req, res) => {
  const { action, email, password, name } = req.body;

  if (!action || !email || !password) {
    return res.json({ success: false, message: "Заполните все поля" });
  }

  const emailNorm = String(email).trim().toLowerCase();

  try {
    if (action === "register") {
      if (!name || !String(name).trim()) {
        return res.json({ success: false, message: "Укажите имя" });
      }

      const exists = await dbGet("SELECT id FROM users WHERE email = ?", [emailNorm]);
      if (exists) {
        return res.json({ success: false, message: "Такой email уже зарегистрирован" });
      }

      const hash = await bcrypt.hash(password, 10);
      const now = new Date().toISOString();
      await dbRun(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
        [Date.now(), String(name).trim(), emailNorm, hash, now]
      );

      return res.json({ success: true, message: "Аккаунт создан. Теперь войдите." });
    }

    if (action === "login") {
      const user = await dbGet("SELECT id, name, email, password_hash FROM users WHERE email = ?", [emailNorm]);
      if (!user) {
        return res.json({ success: false, message: "Неверный email или пароль" });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.json({ success: false, message: "Неверный email или пароль" });
      }

      return res.json({
        success: true,
        message: `Добро пожаловать, ${user.name}!`,
        user: { id: user.id, name: user.name, email: user.email }
      });
    }

    return res.json({ success: false, message: "Неизвестное действие" });
  } catch (e) {
    console.error("Ошибка в /api/auth:", e);
    return res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

app.get("/api/tours", async (_req, res) => {
  try {
    const rows = await dbAll(
      `SELECT t.*, tm.mountain_id, m.name as mountain_name, m.region as mountain_region, m.height as mountain_height
       FROM tours t
       LEFT JOIN tour_mountains tm ON tm.tour_id = t.tour_id
       LEFT JOIN mountains m ON m.mountain_id = tm.mountain_id`
    );
    res.json(mapToursWithMountains(rows));
  } catch (e) {
    console.error("Ошибка в /api/tours:", e);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

app.get("/api/tours/:id", async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT t.*, tm.mountain_id, m.name as mountain_name, m.region as mountain_region, m.height as mountain_height
       FROM tours t
       LEFT JOIN tour_mountains tm ON tm.tour_id = t.tour_id
       LEFT JOIN mountains m ON m.mountain_id = tm.mountain_id
       WHERE t.tour_id = ?`,
      [req.params.id]
    );
    const result = mapToursWithMountains(rows);
    if (!result.length) {
      return res.status(404).json({ success: false, message: "Тур не найден" });
    }
    res.json(result[0]);
  } catch (e) {
    console.error("Ошибка в /api/tours/:id:", e);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

app.get("/api/mountains", async (_req, res) => {
  try {
    const mountains = await dbAll("SELECT mountain_id as id, name, region, height FROM mountains");
    res.json(mountains);
  } catch (e) {
    console.error("Ошибка в /api/mountains:", e);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

app.post("/api/tickets", async (req, res) => {
  const { email, tour_id: tourId, status = "pending" } = req.body;

  if (!email || !tourId) {
    return res.json({ success: false, message: "Укажите email и тур" });
  }

  const emailNorm = String(email).trim().toLowerCase();

  try {
    const user = await dbGet("SELECT id FROM users WHERE email = ?", [emailNorm]);
    if (!user) {
      return res.json({ success: false, message: "Сначала зарегистрируйтесь или войдите" });
    }

    const tour = await dbGet("SELECT tour_id FROM tours WHERE tour_id = ?", [tourId]);
    if (!tour) {
      return res.json({ success: false, message: "Тур не найден" });
    }

    const purchaseDate = new Date().toISOString();
    const result = await dbRun(
      "INSERT INTO tickets (user_id, tour_id, purchase_date, status) VALUES (?, ?, ?, ?)",
      [user.id, tourId, purchaseDate, status]
    );

    return res.json({
      success: true,
      ticket_id: result.lastID,
      message: "Бронирование сохранено",
      purchase_date: purchaseDate
    });
  } catch (e) {
    console.error("Ошибка в /api/tickets:", e);
    return res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

app.get("/api/tickets", async (req, res) => {
  const email = req.query.email ? String(req.query.email).trim().toLowerCase() : null;
  try {
    let userId = null;
    if (email) {
      const user = await dbGet("SELECT id FROM users WHERE email = ?", [email]);
      if (user) userId = user.id;
      else return res.json([]);
    }
    const params = [];
    let sql =
      "SELECT ticket_id, user_id, tour_id, purchase_date, status FROM tickets ORDER BY purchase_date DESC";
    if (userId) {
      sql = "SELECT ticket_id, user_id, tour_id, purchase_date, status FROM tickets WHERE user_id = ? ORDER BY purchase_date DESC";
      params.push(userId);
    }
    const tickets = await dbAll(sql, params);
    res.json(tickets);
  } catch (e) {
    console.error("Ошибка в /api/tickets (GET):", e);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// Фолбэк для SPA/статических роутов без использования path-to-regexp
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
