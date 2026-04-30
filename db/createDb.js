import { connect } from "./connect.js";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

await db.query("drop table if exists votes");
await db.query("drop table if exists tracks");
await db.query("drop table if exists artist");
await db.query("drop table if exists users");
await db.query("drop table if exists session");
await db.query("drop table if exists genre");

await db.query(`
    create table genre (
        genre_id   integer primary key,
        genre text
    )
`);

await db.query(`
    create table artist (
        artist_id   integer primary key,
        artist text
    )
`);

await db.query(`
    create table tracks (
        track_id   integer primary key,
        songname text,
        artist_id integer references artist,
        genre_id integer references genre
    )
`);

await db.query(`
    create table session (
        session_id   integer primary key,
        genre_id integer references genre
    )
`);

await db.query(`
    create table users (
        user_id   integer primary key,
        name text
    )
`);

await db.query(`
    create table votes (
        session_id integer references session,
        user_id integer references users,
        track_id integer references tracks
    )
`);

await db.end();
console.log("Database successfully recreated. KOM NUUUUU!!!!");
