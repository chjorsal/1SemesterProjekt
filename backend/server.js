import express from "express";
import { pool } from "../db/connect.js";

const db = pool();

const port = 3000;
const server = express();
server.use(express.json());
server.use(express.static("frontend"));
server.use(onEachRequest);
server.post("/api/users", onPostUser);
server.post("/api/sessions", onPostSession);
server.get("/api/sessions/:sessionId", onGetSession);
server.post("/api/votes", onPostVote);
server.delete("/api/votes", onResetVote);
server.get("/api/suggestions/:sessionId", onRandomSuggestionStart);
server.get("/api/updatefrontend/:sessionId", updateFrontEnd);

server.listen(port, onLoadLogPort);

async function onPostUser(request, response) {
  // Opret bruger
  try {
    const name = request.body.name;

    if (!name || name.trim() === "") {
      return response.status(400).json({ error: "Navn mangler" });
    }

    const idResult = await db.query(
      `SELECT COALESCE(MAX(user_id), 0) + 1 AS next_id FROM users`,
    );
    const nextId = idResult.rows[0].next_id;

    await db.query(`INSERT INTO users (user_id, name) VALUES ($1, $2)`, [
      nextId,
      name.trim(),
    ]);

    response.json({ user_id: nextId });
  } catch (error) {
    console.error("User error:", error.message);
    response.status(500).json({ error: error.message });
  }
}

async function onPostSession(request, response) {
  // Opret session
  try {
    const genreId = request.body.genre_id;

    if (!genreId) {
      return response.status(400).json({ error: "genre_id mangler" });
    }

    const idResult = await db.query(
      `SELECT COALESCE(MAX(session_id), 0) + 1 AS next_id FROM session`,
    );
    const nextId = idResult.rows[0].next_id;

    await db.query(
      `INSERT INTO session (session_id, genre_id) VALUES ($1, $2)`,
      [nextId, genreId],
    );

    response.json({ session_id: nextId });
  } catch (error) {
    console.error("Session error:", error.message);
    response.status(500).json({ error: error.message });
  }
}

async function onGetSession(request, response) {
  // Hent session info brugres til at finde en session
  try {
    const sessionId = request.params.sessionId;
    const result = await db.query(
      `SELECT * FROM session WHERE session_id = $1`,
      [sessionId],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ error: "Session findes ikke" });
    }

    response.json(result.rows[0]);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function onPostVote(request, response) {
  // opretter votes
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
  } catch (error) {
    console.error("Vote error:", error.message);
    response.status(500).json({ error: error.message });
  }
}

async function onRandomSuggestionStart(request, respones) {
  const sessionId = request.params.sessionId;
  await db.query(
    `  
  delete from sessiontracks where session_id = $1
  
`,
    [sessionId],
  );

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
      [sessionId, trackId], // 1 skal i denne linje skal laves om til sessionId
    );
  }

  respones.json(dbResult.rows);
}

async function updateFrontEnd(request, response) {
  const dbResult = await db.query(`
  select t.songname, a.artist, v.session_id, v.track_id, count (user_id)
  as votes from votes v
  right join sessiontracks st using (session_id, track_id) 
  join tracks t on t.track_id = st.track_id
  join artist a on a.artist_id = t.artist_id 
  where session_id = 1 group by (t.songname, a.artist, v.session_id, v.track_id) 
  order by votes DESC;
`);
  response.json(dbResult.rows);
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

function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  next();
}

function onLoadLogPort() {
  console.log("Server er loadet med port", port);
}
