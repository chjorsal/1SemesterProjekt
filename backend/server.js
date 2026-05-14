import express from "express";
import { pool } from "../db/connect.js";

const db = pool();

const port = 3000;
const server = express();
server.use(express.json());
server.use(express.static("frontend"));
server.post("/api/votes", onPostVote);
server.delete("/api/votes", onResetVote);
server.get("/api/suggestions/:sessionId", onRandomSuggestionStart);
server.get("/api/suggestions/:sessionId", updateRandomSuggestions);
server.get("/api/updatefrontend/:sessionId", updateFrontEnd);

server.listen(port, onLoadLogPort);

async function onPostVote(request, response) {
  try {
    const trackId = request.body.track_id;
    const sessionId = request.body.session_id;
    const userId = request.body.user_id;

    const existingVote = await db.query(
      `SELECT * FROM votes WHERE user_id = $1 AND session_id = $2`,
      [userId, sessionId],
    );

    if (existingVote.rows.length > 0) {
      return response.status(400).json({
        error: "User already voted",
      });
    }

    await db.query(
      `INSERT INTO votes (session_id, user_id, track_id)
       VALUES ($1, $2, $3)`,
      [sessionId, userId, trackId],
    );

    response.json({ success: true });
    updateFrontEnd();
  } catch (error) {
    console.error("Vote error:", error.message);
    response.status(500).json({ error: error.message });
  }
}

async function onRandomSuggestionStart(request, respones) {
  const sessionId = request.params.sessionId;
  const dbResult = await db.query(`  
  select t.songname, a.artist, t.track_id
  from tracks t
  join artist a 
    on t.artist_id = a.artist_id
    where t.genre_id IN (1, 2, 3)
  order by random()
  limit 5
  
`);

  const suggestions = dbResult.rows;

  for (let i = 0; i < suggestions.length; i++) {
    const trackId = suggestions[i].track_id;

    await db.query(
      `
    INSERT INTO sessionTracks (session_id, track_id)
    VALUES ($1, $2)
    `,
      [1, trackId], // 1 skal i denne linje skal laves om til sessionId
    );
  }

  respones.json(dbResult.rows);
}

async function updateRandomSuggestions(request, respones) {
  const dbResult = await db.query(`

  select t.songname, a.artist
  from tracks t
  join artist a 
    on t.artist_id = a.artist_id
    where t.genre_id IN (1, 2, 3)
  order by random()
  limit 4;
`);
  respones.json(dbResult.rows);
}

async function updateFrontEnd(request, response) {
  const updateResult = await db.query(`
  select t.songname, a.artist, session_id, track_id, count (user_id) as votes 
  from votes 
  join tracks t on t.track_id = v.track_id
  join artist a on t.artist_id = a.artist_id
  right join sessiontracks using (session_id, track_id) where session_id = 1 
  group by (session_id, track_id) 
  order by votes DESC 
  limit 5;
  
`);
  response.json(updateResult.rows);
}

// Denne funktion sletter alle stemmer i vores database
// Så det er muligt at stemme igen på en sang
async function onResetVote(request, respones) {
  try {
    await db.query(`DELETE FROM votes`);
    respones.json({ success: true });
  } catch (error) {
    console.error("Reset error:", error.message);
    respones.status(500).json({ error: error.message });
  }
}

function onLoadLogPort() {
  console.log("Server er loadet med port", port);
}
