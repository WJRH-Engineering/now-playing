const config = require('./config.json')

const bunyan = require('bunyan')
const prettyStream = require('bunyan-prettystream')

const stream = require('stream')
const fetch = require('node-fetch')

const out_pretty = new prettyStream
out_pretty.pipe(process.stdout)

const remote_url = config.logging_server

// Utility function, returns a promise that 
// resolves after the given number of seconds
const pause = function(duration) {
	return new Promise(function(resolve, reject){
		setTimeout(resolve, duration * 1000)
	})
}

const begin_heartbeat = async function(period){
	while(true){
		await pause(period)
		await write_remote('HEARTBEAT')
	}
}

// Sends a post request to the remote_url with the given data
const write_remote = async function(event, data){
	const request = fetch(remote_url, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({ 
				event: event,
				data: data,
				sender: "now-playing" 
			})
		}).catch(err => console.log(err))

	await request
}

const remote = new stream.Writable({
	write: async function(chunk, encoding, next){
		fetch(remote_url, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: "POST",
			body: JSON.stringify({ event: "LOG", data: chunk.toString('utf8')})
		}).catch(err => {})
		next()
	}
})

const log = bunyan.createLogger({
	name: "now-playing",
	streams: [
	{
		level: 'debug',
		type: 'raw',
		stream: out_pretty
	},
	{
		level: 'info',
		type: 'stream',
		stream: remote
	}
	]
})

module.exports = log

begin_heartbeat(5)