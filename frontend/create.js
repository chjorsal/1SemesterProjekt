const nameInput = document.getElementById("nameInput");
const createUserBtn = document.getElementById("createUserBtn");
const nameError = document.getElementById("nameError");

const newSessionBtn = document.getElementById("newSessionBtn");
const sessionInput = document.getElementById("sessionInput");

let userId = sessionStorage.getItem("user_id") || null;

createUserBtn.addEventListener("click", onCreateUser);
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onCreateUser();
});

async function onCreateUser() {
  try {
    if (userId) {
      nameError.textContent = "You are already a registered user.";
      return;
    }

    const name = nameInput.value.trim();
    if (!name) {
      nameError.textContent = "Please type your name.";
      return;
    }

    createUserBtn.disabled = true;
    nameError.textContent = "";

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) throw new Error("Could not create user");

    const data = await response.json();
    userId = data.user_id;
    sessionStorage.setItem("user_id", data.user_id);
    nameError.textContent = `Welcome ${name}!`;
  } catch (error) {
    nameError.textContent = error.message;
    createUserBtn.disabled = false;
  }
}

newSessionBtn.addEventListener("click", function () {
  if (!userId) {
    sessionError.textContent = "Create a user first.";
    return;
  }
  window.location.href = "mood.html";
});
