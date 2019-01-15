const fetch = require("node-fetch")
const { oneLineTrim } = require("common-tags")

// our LastFm api key, if a new one is needed for any reason,
// replace it here
const LASTFM_API_KEY = "14cacc2d28210dcd318ffa2085778844"

exports.lookup = async function(song){
	//input validation
	if(!song)			throw "input is not defined"
	if(!song.title)		throw "title not defined"
	if(!song.artist)	throw "artist not defined"

	//generate URL for LastFm call
	URL = oneLineTrim`
		http://ws.audioscrobbler.com/2.0/?method=track.getInfo
		&api_key=${LASTFM_API_KEY}
		&artist=${encodeURI(song.artist.replace(" ", "+"))}
		&track=${encodeURI(song.title.replace(" ", "+"))}
		&autocorrect
		&format=json`

	//make the API call and await the result
	result = await fetch(URL)

	// format the result as JSON and return
	return result.json()
}

exports.lookup_album = async function(mbid) {
	if(!mbid)	throw "input is not defined"

	//generate URL for LastFm call
	URL = oneLineTrim`
		http://ws.audioscrobbler.com/2.0/?method=album.getInfo
		&api_key=${LASTFM_API_KEY}
		&mbid=${mbid}
		&autocorrect
		&format=json`

	//make the API call and await the result
	result = await fetch(URL)

	// format the result as JSON and return
	return result.json()
}

// download the best image in the array and return it as a blob
exports.download_image = async function(images){
	const image = images[images.length - 1] // highest quality image is always last in the array
	const image_url = image["#text"]

	const data = await fetch(image_url).then(res => res.arrayBuffer())

	return data
}

// generate a set of ID3 tags based a last-fm lookup of song
exports.get_id3_tags = async function(song) {
	const data = await exports.lookup(song)
	const image = await exports.download_image(data.track.album.image)

	// need to make a second api call to get album length
	const album_data = await exports.lookup_album(data.track.album.mbid)
	const album_length = album_data.album.tracks.track.length

	const track_position = data.track.album['@attr'].position

	return {
		title: data.track.name,
		artist: data.track.artist.name,
		album: data.track.album.title,
		image: {
			mime: 'png',
			type: {id: 3, name: 'front cover'},
			description: undefined,
			imageBuffer: Buffer.from(image),
		},
		trackNumber: `${track_position}/${album_length}`,
		mbid: data.track.mbid,
	}
}