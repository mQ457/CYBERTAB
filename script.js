// Общие данные туров и фильтры, используются на главной и на странице tours.html
let toursData = [
  {
    id: "elbrus-classic",
    name: "Эльбрус Классик",
    location: "Кавказ, Эльбрус",
    season: "Июль",
    days: 6,
    minPeople: 1,
    maxPeople: 8,
    difficulty: "Средний",
    price: 52000,
    category: "Летние походы",
    image: "image/popular_tour1.png",
    description: "Восхождение с опытным гидом, мягкий темп и красивейшие виды.",
    mountains: [{ id: "elbrus", name: "Эльбрус", region: "Кавказ", height: 5642 }]
  },
  {
    id: "kilimanjaro",
    name: "Килиманджаро Лайт",
    location: "Танзания, Килиманджаро",
    season: "Август",
    days: 8,
    minPeople: 2,
    maxPeople: 10,
    difficulty: "Продвинутый",
    price: 138000,
    category: "Экспедиции",
    image: "image/popular_tour2.png",
    description: "Маршрут Мачаме, портеры, повар и усиленная акклиматизация.",
    mountains: [{ id: "kilimanjaro", name: "Килиманджаро", region: "Танзания", height: 5895 }]
  },
  {
    id: "altai",
    name: "Алтай. Долина озёр",
    location: "Россия, Алтай",
    season: "Июнь",
    days: 5,
    minPeople: 1,
    maxPeople: 12,
    difficulty: "Лёгкий",
    price: 39000,
    category: "Походы выходного дня",
    image: "image/popular_tour3.png",
    description: "Маршрут без сложных перевалов, для первого знакомства с горами.",
    mountains: [{ id: "aktru", name: "Актру", region: "Алтай", height: 4044 }]
  },
  {
    id: "nepal",
    name: "Эверест трек",
    location: "Непал, Сагарматха",
    season: "Октябрь",
    days: 12,
    minPeople: 2,
    maxPeople: 12,
    difficulty: "Продвинутый",
    price: 165000,
    category: "Экспедиции",
    image: "image/Rectangle 10.png",
    description: "Классический трек к базовому лагерю Эвереста с лоджиями.",
    mountains: [{ id: "everest", name: "Джомолунгма", region: "Гималаи", height: 8848 }]
  },
  {
    id: "georgia",
    name: "Сванетия и Ушба",
    location: "Грузия, Сванетия",
    season: "Сентябрь",
    days: 7,
    minPeople: 1,
    maxPeople: 14,
    difficulty: "Средний",
    price: 67000,
    category: "Летние походы",
    image: "image/Rectangle 11.png",
    description: "Трекинг между сванскими башнями, сыры, вино и вид на Ушбу.",
    mountains: [{ id: "ushba", name: "Ушба", region: "Сванетия", height: 4710 }]
  },
  {
    id: "kamchatka",
    name: "Камчатка. Вулканы",
    location: "Россия, Камчатка",
    season: "Июль",
    days: 9,
    minPeople: 3,
    maxPeople: 10,
    difficulty: "Средний",
    price: 92000,
    category: "Активные туры",
    image: "image/Rectangle 9.png",
    description: "Толбачик, вулканические поля, горячие источники и медведи.",
    mountains: [{ id: "tolbachik", name: "Толбачик", region: "Камчатка", height: 3682 }]
  }
];

const selectors = {
  location: document.querySelector("#loc"),
  season: document.querySelector("#Day"),
  people: document.querySelector("#People"),
  findButton: document.querySelector(".buttonS"),
  resultsContainer: document.querySelector("#tour-cards"),
  filterForm: document.querySelector("#tours-filter"),
  detailContainer: document.querySelector("#tour-detail"),
  ticketForm: document.querySelector("#ticket-form"),
  ticketMessage: document.querySelector("#ticket-message")
};

async function loadToursFromApi() {
  try {
    const response = await fetch("/api/tours");
    const data = await response.json();
    if (Array.isArray(data) && data.length) {
      toursData = data.map((tour) => ({
        id: tour.id,
        name: tour.name,
        location: tour.location,
        season: tour.season,
        days: tour.days,
        minPeople: 1,
        maxPeople: tour.maxParticipants || tour.max_participants || tour.maxPeople || 12,
        difficulty: tour.difficulty || "Средний",
        price: tour.price,
        category: tour.category || tour.season || "Тур",
        image: tour.image,
        description: tour.description,
        mountains: tour.mountains || []
      }));
    }
  } catch (e) {
    console.warn("Не удалось получить туры из API, используется статический список");
  }
}

function uniqueValues(list, key) {
  return [...new Set(list.map((item) => item[key]))];
}

function fillSelect(select, values, placeholder) {
  if (!select) return;
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  select.appendChild(empty);
  values.forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  });
}

function populateFilters() {
  fillSelect(selectors.location, uniqueValues(toursData, "location"), "Любая локация");
  fillSelect(selectors.season, uniqueValues(toursData, "season"), "Любая дата");
  fillSelect(
    selectors.people,
    uniqueValues(toursData, "maxPeople").map((p) => String(p)),
    "Сколько человек"
  );
}

function getFilters(source = "controls") {
  if (source === "controls") {
    return {
      location: selectors.location ? selectors.location.value : "",
      season: selectors.season ? selectors.season.value : "",
      people: selectors.people ? Number(selectors.people.value) || null : null
    };
  }
  if (source === "storage") {
    try {
      const saved = localStorage.getItem("tourFilters");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveFilters(filters) {
  localStorage.setItem("tourFilters", JSON.stringify(filters));
}

function filterTours(filters) {
  return toursData.filter((tour) => {
    const locationOk = filters.location ? tour.location === filters.location : true;
    const seasonOk = filters.season ? tour.season === filters.season : true;
    const peopleOk = filters.people
      ? filters.people >= tour.minPeople && filters.people <= tour.maxPeople
      : true;
    return locationOk && seasonOk && peopleOk;
  });
}

function renderTours(tours) {
  if (!selectors.resultsContainer) return;
  selectors.resultsContainer.innerHTML = "";
  if (!tours.length) {
    selectors.resultsContainer.innerHTML =
      '<div class="empty-state">Нет туров по выбранным параметрам</div>';
    return;
  }

  tours.forEach((tour) => {
    const card = document.createElement("div");
    card.className = "tour-card";
    card.innerHTML = `
      <div class="tour-thumb" style="background-image:url('${tour.image}')"></div>
      <div class="tour-body">
        <p class="tour-category">${tour.category} · ${tour.season}</p>
        <h3>${tour.name}</h3>
        <p class="tour-desc">${tour.description}</p>
        <div class="tour-meta">
          <span>${tour.location}</span>
          <span>${tour.days} дней</span>
          <span>${tour.difficulty}</span>
          <span>${tour.minPeople}-${tour.maxPeople} чел.</span>
        </div>
        <div class="tour-footer">
          <div class="tour-price">от ${tour.price.toLocaleString("ru-RU")} ₽</div>
          <a class="tour-cta" href="tour-detail.html?id=${tour.id}">Подробнее</a>
        </div>
      </div>
    `;
    selectors.resultsContainer.appendChild(card);
  });
}

function handleIndexSearch() {
  if (!selectors.findButton) return;
  selectors.findButton.addEventListener("click", (evt) => {
    evt.preventDefault();
    const filters = getFilters("controls");
    saveFilters(filters);
    window.location.href = "tours.html";
  });
}

function hydrateFiltersOnToursPage() {
  if (!selectors.filterForm) return;
  const saved = getFilters("storage");
  if (selectors.location && saved.location) selectors.location.value = saved.location;
  if (selectors.season && saved.season) selectors.season.value = saved.season;
  if (selectors.people && saved.people) selectors.people.value = saved.people;
}

function initToursPage() {
  if (!selectors.filterForm) return;
  selectors.filterForm.addEventListener("change", () => {
    const filters = getFilters("controls");
    saveFilters(filters);
    renderTours(filterTours(filters));
  });

  const initialFilters = { ...getFilters("storage"), ...getFilters("controls") };
  renderTours(filterTours(initialFilters));
}

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function renderTourDetail() {
  if (!selectors.detailContainer) return;
  const tourId = getQueryParam("id");
  const tour = toursData.find((item) => item.id === tourId);
  if (!tour) {
    selectors.detailContainer.innerHTML = `
      <div class="empty-state">
        Тур не найден. Вернуться на <a href="tours.html">страницу туров</a>.
      </div>
    `;
    return;
  }

  const mountainsHtml =
    tour.mountains && tour.mountains.length
      ? tour.mountains
          .map(
            (m) =>
              `<li><strong>${m.name}</strong> — ${m.region || "регион не указан"}, ${m.height ? `${m.height} м` : "высота неизвестна"}</li>`
          )
          .join("")
      : "<li>Связанных гор пока нет</li>";

  selectors.detailContainer.innerHTML = `
    <section class="detail-hero">
      <div class="detail-hero__text">
        <p class="eyebrow">${tour.category || "Тур"}</p>
        <h1>${tour.name}</h1>
        <p class="lead">${tour.description}</p>
        <div class="detail-meta">
          <span>${tour.location}</span>
          <span>${tour.days} дней</span>
          <span>${tour.difficulty}</span>
          <span>${tour.minPeople}-${tour.maxPeople} чел.</span>
        </div>
        <div class="detail-price">от ${tour.price.toLocaleString("ru-RU")} ₽</div>
      </div>
      <div class="detail-hero__image" style="background-image:url('${tour.image}')"></div>
    </section>

    <section class="detail-content">
      <div class="detail-block">
        <h2>Горные объекты по ER-диаграмме</h2>
        <ul class="mountain-list">
          ${mountainsHtml}
        </ul>
      </div>
      <div class="detail-block">
        <h2>Забронировать билет</h2>
        <p class="detail-note">Используйте email зарегистрированного пользователя, чтобы заявка попала в таблицу tickets.</p>
        <form id="ticket-form" class="ticket-form">
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required>
          </label>
          <input type="hidden" name="tour_id" value="${tour.id}">
          <label>
            Статус
            <select name="status">
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="canceled">canceled</option>
            </select>
          </label>
          <button type="submit">Отправить</button>
          <div id="ticket-message" class="message"></div>
        </form>
      </div>
    </section>
  `;
}

async function handleTicketForm() {
  if (!selectors.ticketForm) return;
  selectors.ticketForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = {
      email: formData.get("email"),
      tour_id: formData.get("tour_id"),
      status: formData.get("status") || "pending"
    };

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const statusClass = result.success ? "success" : "error";
      selectors.ticketMessage.textContent = result.message || "Не удалось создать заявку";
      selectors.ticketMessage.className = `message ${statusClass}`;
      if (result.success) {
        event.target.reset();
      }
    } catch (e) {
      selectors.ticketMessage.textContent = "Сервер недоступен, попробуйте позже.";
      selectors.ticketMessage.className = "message error";
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadToursFromApi();
  populateFilters();
  hydrateFiltersOnToursPage();
  handleIndexSearch();
  initToursPage();
  renderTourDetail();
  selectors.ticketForm = document.querySelector("#ticket-form");
  selectors.ticketMessage = document.querySelector("#ticket-message");
  handleTicketForm();
});

