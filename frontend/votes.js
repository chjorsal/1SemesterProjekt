const nameInput = document.getElementById("nameInput");
const createUserBtn = document.getElementById("createUserBtn");
const nameError = document.getElementById("nameError");

const newSessionBtn = document.getElementById("newSessionBtn");
const sessionInput = document.getElementById("sessionInput");
const confirmJoinBtn = document.getElementById("confirmJoinBtn");
const sessionError = document.getElementById("sessionError");

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

async function onJoinSession() {
  try {
    if (!userId) {
      sessionError.textContent = "Opret en bruger først.";
      return;
    }

    if (sessionId) {
      sessionError.textContent = "Du er allerede i en session.";
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

    sessionId = inputId;
    window.location.href = `fest.html?id=${sessionId}&user=${userId}`;

    sessionError.textContent = `Du har joined session ${sessionId}!`;
  } catch (error) {
    sessionError.textContent = error.message;
    confirmJoinBtn.disabled = false;
  }
}
async function loadVotes() {
  const response = await fetch("/api/votes");
  const votes = await response.json();

  votes.forEach(function (song) {
    const btn = document.querySelectorAll(
      'button[data-track-id="' + song.trackId + '"]',
    );

    if (btn) {
      const countEl = btn.nextElementSibling;
      countEl.textContent = song.votes;
    }
  });
}

async function vote(btn) {
  if (btn.disabled) {
    return;
  }

  const trackId = btn.dataset.trackId;

  const response = await fetch("/api/votes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      track_id: trackId,
      user_id: userId,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    console.error("Server error:", response.status, await response.text());
    btn.disabled = true;
    btn.textContent = "Har stemt";
    return;
  }

  const countEl = btn.nextElementSibling;
  countEl.textContent = parseInt(countEl.textContent) + 1;
  btn.disabled = true;
  btn.textContent = "Har stemt";
}

//loadVotes();
