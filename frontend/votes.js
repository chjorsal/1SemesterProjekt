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
    body: JSON.stringify({ track_id: trackId, user_id: 1, session_id: 1 }),
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
