const nameInput = document.getElementById("nameInput");
const createUserBtn = document.getElementById("createUserBtn");
const nameError = document.getElementById("nameError");

const newSessionBtn = document.getElementById("newSessionBtn");
const sessionInput = document.getElementById("sessionInput");


const params = new URLSearchParams(window.location.search);
let userId = params.get("user") || sessionStorage.getItem("user_id") || null;
let sessionId = params.get("id") || null;

createUserBtn.addEventListener("click", onCreateUser);
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onCreateUser();
});

async function onCreateUser() {
  try {
    if (userId) {
      nameError.textContent = "Du er allerede oprettet som bruger.";
      return;
    }

    const name = nameInput.value.trim();
    if (!name) {
      nameError.textContent = "Skriv venligst dit navn.";
      return;
    }

    createUserBtn.disabled = true;
    nameError.textContent = "";

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) throw new Error("Kunne ikke oprette bruger");

    const data = await response.json();
    userId = data.user_id;
    sessionStorage.setItem("user_id", data.user_id);
    nameError.textContent = `Velkommen ${name}!`;
  } catch (error) {
    nameError.textContent = error.message;
    createUserBtn.disabled = false;
  }
}

newSessionBtn.addEventListener("click", async function () {
  try {
    if (!userId) {
      sessionError.textContent = "Opret en bruger først.";
      return;
    }

    if (sessionId) {
      sessionError.textContent = "Du er allerede i en session.";
      return;
    }

    newSessionBtn.disabled = true;
    sessionError.textContent = "";

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ genre_id: 2 }),
    });

    if (!response.ok) throw new Error("Kunne ikke oprette session");

    const data = await response.json();
    sessionId = data.session_id;
    window.location.href = `fest.html?id=${sessionId}&user=${userId}`;
  } catch (error) {
    sessionError.textContent = error.message;
    newSessionBtn.disabled = false;
  }
});

confirmJoinBtn.addEventListener("click", onJoinSession);
sessionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onJoinSession();
});

