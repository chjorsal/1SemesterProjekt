const element = [];
const elements = document.querySelectorAll(".song-title");
const Artistelements = document.querySelectorAll(".song-artist");
const playing = document.querySelector(".now-playing-mid");
const playingArtist = document.querySelector(".now-playing-bottom");
const buttonTrackId = document.querySelectorAll(".vote-button");

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");

let suggestions = [];

await loadAndRenderSuggestions(sessionId, element);
await forEachRenderTracks();
await forEachRenderArtist();
await forEachButtonTrackId();

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

async function forEachRenderTracks() {
  elements.forEach((currentElement, index) => {
    currentElement.textContent = suggestions[index].songname;
  });
}

async function forEachRenderArtist() {
  Artistelements.forEach((currentElement, index) => {
    currentElement.textContent = suggestions[index].artist;
  });
}

async function forEachButtonTrackId() {
  buttonTrackId.forEach((currentElement, index) => {
    currentElement.setAttribute("data-track-id", suggestions[index].track_id);
  });
}
