  select t.songname, a.artist, session_id, track_id, count (user_id) as votes 
  from votes 
  join tracks t on t.track_id = v.track_id
  join artist a on t.artist_id = a.artist_id
  right join sessiontracks using (session_id, track_id) where session_id = 1 
  group by (session_id, track_id) 
  order by votes DESC 
  limit 5;





  select st.session_id, st.track_id from sessiontracks st
  join tracks t on t.track_id = st.track_id
  join artist a on a.artist_id = t.artist_id
  join votes v on 



select t.songname, a.artist, v.session_id, v.track_id, count (user_id) as votes 
from votes v
right join sessiontracks st using (session_id, track_id) 
join tracks t on t.track_id = st.track_id
join artist a on a.artist_id = t.artist_id 
where session_id = 1 group by (t.songname, a.artist, v.session_id, v.track_id) order by votes DESC ;