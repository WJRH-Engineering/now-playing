# now-playing
A super lightweigh API that tells you what's playing on WJRH

For development and testing purposes, the now-playing API currently lives here: http://45.55.38.183:4001/now-playing

### Response Fields
  - isRobo: whether or not this a RoboDJ track,
  - title: title of the track,
  - artist: artist,
  - album: album of the track,
  - image: album artwork,
  
### Example Response
```json
{
  "isRobo": true,
  "title":  "PPP",
  "artist": "Beach House",
  "album":  "Depression Cherry",
  "image":  "https://lastfm.freetls.fastly.net/i/u/300x300/92ee7e4f3afdbe6a9a8c13a4a790baf1.png"
}
```

Not all fields are guaranteed to exist in the response, if information cannot be found on a track, it will not show up.
For example, if the title of a track cannot be found in the last-fm database, the image and album keys will not appear.
This will occur if a DJ has spelled the song incorrectly in Teal, or if a track in the RoboDJ playlist has incorrect metadata.
