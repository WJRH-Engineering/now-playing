const get = require("lodash.get")

const server = require('./server.js')
const last_fm = require('./last-fm.js')
const radio = require("./listener")

const log = require("./log.js")

let most_recent = {}

radio.on("new-track", async function({track, ...rest}){

	let metadata = {}

	// if the track title and author exist,
	// try to look up some additional metadata about them
	if(track.title && track.artist){
		metadata = await last_fm.lookup(track)
	}

	const title = 
			get(metadata, "track.name") 
		||	get(track, "title")

	const artist =
			get(metadata, "track.artist.name") 
		||	get(track, "artist")

	const album = get(metadata, "track.album.title")
	const image = get(metadata, "track.album.image.3.#text")

	most_recent = {title, artist, album, image, ...rest}

	log.info(most_recent, "new-track")
})

radio.on("new-show", async function(show){
	const show_name = show.program ? show.program.name : "RoboDJ"
	log.info({show_name, ...show.program}, "new-show")
})

server.get("/now-playing", function(req, res){
	res.send(most_recent)
})

server.listen(4001)