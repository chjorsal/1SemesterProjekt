const nameInput = document.getElementById("nameInput");
const createUserBtn = document.getElementById("createUserBtn");
const nameError = document.getElementById("nameError");
const sessionInput = document.getElementById("sessionInput");
const confirmJoinBtn = document.getElementById("confirmJoinBtn");
const sessionError = document.getElementById("sessionError");

let userId = sessionStorage.getItem("user_id") || null;

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

confirmJoinBtn.addEventListener("click", onJoinSession);
sessionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onJoinSession();
});

async function onJoinSession() {
  try {
    if (!userId) {
      sessionError.textContent = "Opret en bruger først.";
      return;
    }

    const inputId = sessionInput.value.trim();
    if (!inputId) {
      sessionError.textContent = "Indtast et session ID.";
      return;
    }

    confirmJoinBtn.disabled = true;
    sessionError.textContent = "";

    const response = await fetch(`/api/sessions/${inputId}`);
    if (!response.ok) throw new Error("Session findes ikke");

    window.location.href = `fest.html?id=${inputId}&user=${userId}`;
  } catch (error) {
    sessionError.textContent = error.message;
    confirmJoinBtn.disabled = false;
  }
}
