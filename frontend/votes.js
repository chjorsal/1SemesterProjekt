import { refreshTracks } from "./fest.js";
window.vote = vote;

const params = new URLSearchParams(window.location.search);
let userId = params.get("user") || sessionStorage.getItem("user_id") || null;
let sessionId = params.get("id") || null;

export async function vote(btn) {
  if (btn.disabled) return;
  if (btn.style.opacity === "0") return;

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
    btn.style.opacity = "0";
    btn.disabled = true;
    return;
  }

  document.querySelectorAll(".vote-button").forEach((b) => {
    b.style.opacity = "0";
    b.disabled = true;
  });

  refreshTracks(sessionId);
}

//loadVotes();
