import { refreshTracks } from "./fest.js";
window.vote = vote;

const params = new URLSearchParams(window.location.search);
let userId = params.get("user") || sessionStorage.getItem("user_id") || null;
let sessionId = params.get("id") || null;

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
    btn.hidden = true;
    btn.textContent = "Har stemt";
    return;
  }

  
  refreshTracks(sessionId);
  

  document.querySelectorAll(".vote-button").forEach((b) => {
    b.style.visibility = "hidden";
  });
}

//loadVotes();
