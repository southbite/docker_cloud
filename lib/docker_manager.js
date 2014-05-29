module.exports = {
	port_range:[],
	initialize:function(config, done){

		try{

			var Docker = require('dockerode');
			this.docker = new Docker({host: 'http://' + config.host, port: config.port});
			this.config = config;

			/*
			if (config.kill){
				this.killAllContainers(function(e){

					done(e);

				});
			}
			else
			*/
			done();
			

		}catch(e){
			done(e);
		}
	},
	killAllContainers:function(done){



		/*
		TODO
		var curr_count = 0;
		this.docker.listContainers({}, function (err, containers) {

			containers.map(function(container){



			});

		});
		*/
	},
	getContainerByName:function(containers, name, done){

		var checkName = function(containers, name, callback){

			var found = false;
			containers.map(function(container){

				//console.log('comparing name');
				//console.log(container.Names[0]);
				//console.log('/' + name);
				if (container.Names[0] == '/' + name){
					found = true;
					return callback(null, container);
				}
					
			});

			if (!found)
				callback(null, null);

		}

		if (!containers)
			this.docker.listContainers({}, function (err, containers) {

				if (!err)
					checkName(containers, name, done);

			});
		else
			checkName(containers, name, done);

	},
	process:function(message, callback){
		var _this = this;
		try{

			if (message.action == 'start'){

				_this.getContainerByName(null, message.name, function(e, existing){

					if (e)
						return callback(e);

					if (existing && existing.Status.substring(0,2) == 'Up'){
						 console.log('container with name:' + message.name + ' already up, passing info back');
						callback(null, existing);
					}
					else if (existing){
						callback('Not implemented starting existing container');
					}
					else{
						//console.log('spinning up container!!!');
						_this.docker.createContainer({Image: message.image, name:message.name}, function (err, container) {

						  if (err)
						  	return callback(err);

						  var portBindings = {};

						  //TODO not binding to a specific host port - so one is generated
						  portBindings[message.port + "/tcp"] = [{"HostPort": null}];

						  console.log('starting container with name:' + message.name);
						 
						  container.start(
						  {
						  	"PortBindings": portBindings
						  },
					        function (err, data) {
							  	if (err)
							  		callback(err);
							  	else{
							  		console.log('started container successfully');
							  		
							  		_this.getContainerByName(null, message.name, function(e, started){
							  			callback(e, started);
							  		});

							  		
							  	}
						  });

						});
					}

				});
			}else
				callback('Invalid action: ' + message.action);

		}catch(e){
			callback(e);
		}

	}
}