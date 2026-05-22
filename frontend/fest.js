import { vote } from "./votes.js";

console.log("festloaded");
const errorElement = document.querySelector(".now-playing-mid");
const elements = document.querySelectorAll(".song-title");
const Artistelements = document.querySelectorAll(".song-artist");
const playing = document.querySelector(".now-playing-mid");
const playingArtist = document.querySelector(".now-playing-bottom");
const buttonTrackId = document.querySelectorAll(".vote-button");
const votesCount = document.querySelectorAll(".vote-count");

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");
const userId = params.get("user");

let suggestions = [];

const statusResponse = await fetch(`/api/status/${sessionId}`);
const statusData = await statusResponse.json();

if (statusData.error) {
  await loadAndRenderSuggestions(sessionId, errorElement);
} else {
  await UpdateSuggestion(sessionId, errorElement);
}

await forEachRenderTracks();
await forEachRenderArtist();

let lastTimeLeft = null;
let isChanging = false; // Flag to prevent multiple simultaneous updates

setInterval(async function () {
  const response = await fetch(`/api/status/${sessionId}`);
  const data = await response.json();

  if (lastTimeLeft > 0 && data.timeLeft <= 0 && !isChanging) {
    isChanging = true;
    setTimeout(async function () {
      await UpdateSuggestion(sessionId, errorElement);
      await forEachRenderVotes();

      document.querySelectorAll(".vote-button").forEach((b) => {
        b.style.opacity = "1";
        b.disabled = false;
      });
      isChanging = false;
    }, 500);
  }

  lastTimeLeft = data.timeLeft;
}, 5000);

async function loadAndRenderSuggestions(sessionId, element) {
  try {
    const response = await fetch(`/api/suggestions/${sessionId}`);

    if (!response.ok) {
      element.textContent = "Could not get suggestions, try again later";
      return;
    }

    suggestions = await response.json();
    console.log(suggestions);
  } catch (error) {
    console.error(error);
    element.textContent = "Something went wrong";
  }
}
export async function refreshTracks(sessionId) {
  await UpdateSuggestion(sessionId, errorElement);
}

async function UpdateSuggestion(sessionId, element) {
  try {
    const updateResponse = await fetch(`/api/updatefrontend/${sessionId}`);

    if (!updateResponse.ok) {
      element.textContent = "Could not get suggestions, try again later";
      return;
    }

    suggestions = await updateResponse.json();
    console.log(suggestions);
    await forEachRenderTracks();
    await forEachRenderArtist();
    await forEachButtonTrackId();
    await forEachRenderVotes();
  } catch (error) {
    console.error(error);
    element.textContent = "Something went wrong";
  }
}

async function forEachRenderTracks() {
  elements.forEach((currentElement, index) => {
    if (suggestions[index]) {
      currentElement.textContent = suggestions[index].songname;
    }
  });
}

async function forEachRenderArtist() {
  Artistelements.forEach((currentElement, index) => {
    if (suggestions[index]) {
      currentElement.textContent = suggestions[index].artist;
    }
  });
}

async function forEachButtonTrackId() {
  const buttons = document.querySelectorAll(".vote-button");
  buttons.forEach((currentElement, index) => {
    if (suggestions[index]) {
      currentElement.setAttribute("data-track-id", suggestions[index].track_id);
      currentElement.onclick = function () {
        vote(this);
      };
    }
  });
}

async function forEachRenderVotes() {
  votesCount.forEach((currentElement, index) => {
    if (suggestions[index]) {
      currentElement.textContent = suggestions[index].votes;
    }
  });
}
