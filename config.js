module.exports = {
	size:1, 
	port:8000, 
	services:{
		auth:{
			authTokenSecret:'a256a2fd43bf441483c5177fc85fd9d3',
			systemSecret:'test_secret'
		}
	},
	docker:{
		port:4243,
		/*port_range:[8010, 8020],*/
		port_range:[],
		host:'localhost',
		kill:false//kills all the containers
	}
}