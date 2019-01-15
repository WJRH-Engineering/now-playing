const get = require("lodash.get")

const server = require('./server.js')
const last_fm = require('./last-fm.js')
const radio = require("./listener")

let most_recent = {}

radio.on("new-track", async function(track){

	//try to look up some additional metadata about this track
	const metadata = await last_fm.lookup(track)

	const title = 
			get(metadata, "track.name") 
		||	get(track, "title")

	const artist =
			get(metadata, "track.artist.name") 
		||	get(track, "artist")

	const album = get(metadata, "track.album.title")
	const image = get(metadata, "track.album.image.3.#text")

	most_recent = { title, artist, album, image }
})

server.get("/now-playing", function(req, res){
	res.send(most_recent)
})

server.listen(4001)