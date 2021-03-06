const fetch = require('node-fetch')
const equals = require('deep-equal')
const EventEmitter = require('events')

const get = require("lodash.get")

const radio = new EventEmitter()

// wrap setTimeout function in a promise api
const pause = function(time_ms){
	return new Promise(function(resolve, reject){
		setTimeout(resolve, time_ms)
	})
}

const tealURL = "https://api.teal.cool/organizations/wjrh/latest"
const iceCastURL = "http://www.wjrh.org:8000/status-json.xsl"

const get_latest = async function(){
	let output = {}

	// check teal to see if there is a live DJ
	const teal_request = fetch(tealURL).then(res => res.json())
	const teal = await teal_request

	// if there is, return data about the show
	if(teal.event != "episode-end"){
		output = {isRobo: false, ...teal}
		return output
	}

	// if no Live DJ, ask RoboDJ what it is playing
	const robo_request = fetch(iceCastURL).then(res => res.json())
	const robo = await robo_request

	// do some post processing on the icecast response
	const data_raw = robo.icestats.source[0].title
	const data = data_raw
		.replace(/\[.*\]/, "")		// ignore anything between brackets
		.split(" - ")				// data should be hyphon delimited
		.map(elem => elem.trim())	// trim each element


	if(data.length == 2){ 
		output = {
			isRobo: true, 
			track: {
				title: data[0], artist: data[1] 
			}
		}
	} else {
		output = {
			isRobo: true, 
			track: {
				title: data_raw
			}
		}
	}

	return output
}

const listen = async function(time_ms) {
	let last = {}
	let next = {}

	while(true) {		
		await pause(time_ms)
		next = await get_latest()

		// if any part of the track data has changed, emit new-track event
		if(!equals(last, next)){
			radio.emit("new-track", next)
		}

		// if the episode has changed, emit the new-show event
		if(get(last, 'episode.id') != get(next, 'episode.id')){
			radio.emit("new-show", next)
		}

		last = next
	}
}

listen(200)

module.exports = radio