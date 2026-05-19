import { refreshTracks } from "./fest.js";
window.vote = vote;

const params = new URLSearchParams(window.location.search);
let userId = params.get("user") || sessionStorage.getItem("user_id") || null;
let sessionId = params.get("id") || null;

/*async function loadVotes() {
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
*/

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

  refreshTracks(sessionId);
  const countEl = btn.nextElementSibling;
  //countEl.textContent = parseInt(countEl.textContent) + 1;
  btn.disabled = true;
  btn.textContent = "Har stemt";
}

//loadVotes();
