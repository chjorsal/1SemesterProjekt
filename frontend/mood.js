async function createSession(genreId) {
  const userId = sessionStorage.getItem("user_id");

  if (!userId) {
    window.location.href = "create.html";
    return;
  }

  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genre_id: genreId }),
  });

  const data = await response.json();
  window.location.href = `fest.html?id=${data.session_id}&user=${userId}`;
}
