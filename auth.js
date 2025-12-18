const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".form");
const messageBox = document.getElementById("auth-message");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    forms.forEach((f) => f.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    messageBox.textContent = "";
    messageBox.className = "message";
  });
});

const API_BASE = "http://localhost:3000"; // Node/Express сервер

async function sendAuthForm(form, action) {
  const formData = new FormData(form);
  try {
    const response = await fetch(`${API_BASE}/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name")
      })
    });
    const result = await response.json();
    const statusClass = result.success ? "success" : "error";
    messageBox.textContent = result.message || "Что-то пошло не так";
    messageBox.className = `message ${statusClass}`;
    if (result.success && action === "register") {
      tabs[0].click();
    }
  } catch (e) {
    messageBox.textContent = "Сервер недоступен, попробуйте позже.";
    messageBox.className = "message error";
  }
}

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const action = form.id === "login" ? "login" : "register";
    sendAuthForm(form, action);
  });
});

