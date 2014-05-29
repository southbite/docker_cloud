module.exports = {
	size:5, 
	port:8000, 
	services:{
		auth:{
			authTokenSecret:'a256a2fd43bf441483c5177fc85fd9d3',
			systemSecret:'test_secret'
		}
	},
	docker_instance:{
		size:5
	}
}