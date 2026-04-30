import { connect } from "./connect.js";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

// genre
// artist
// tracks
// session
// user
// votes

await db.query(`
    create table genre (
        genre_id   integer primary key,
        genre text,
    )
`);

await db.query(`
    create table artist (
        artist_id   integer primary key,
        artist text,
    )
`);

await db.query(`
    create table tracks (
        track_id   integer primary key,
        songname text,
        artist_id integer references artist
        genre_id integer references genre
    )
`);

await db.end();
console.log("Database successfully recreated. KOM NUUUUU!!!!");
