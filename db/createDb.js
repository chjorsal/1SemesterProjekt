import { connect } from "./connect.js";
import upload from "pg-upload";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

await db.query("drop table if exists sessionTracks");
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
        genre_id integer references genre,
        trackslength integer 
    )
`);

await db.query(`
    create table session (
        session_id   integer primary key,
        genre_id integer references genre
    )
`);

await db.query(`
    create table sessionTracks (
        session_id integer references session,
        track_id integer references tracks
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
console.log("Importing csv-data into tables...");

await upload(
  db,
  "db/genre.csv",
  `
    copy  genre (genre_id, genre)
    from  stdin
    with  csv header encoding 'UTF-8'
`,
);

await upload(
  db,
  "db/artist.csv",
  `
    copy  artist (artist_id,artist)
    from  stdin
    with  csv header encoding 'UTF-8'
`,
);
await upload(
  db,
  "db/tracks.csv",
  `
    copy  tracks (track_id,songname,artist_id,genre_id,trackslength)
    from  stdin
    with  csv header encoding 'UTF-8'
`,
);
await db.query(
  `
    insert into users
    (user_id, name) values (1,'Mikkel');
    insert into session
    (session_id, genre_id) values (1,2);
`,
);

await db.end();
console.log("Database successfully recreated. KOM NUUUUU!!!!");
