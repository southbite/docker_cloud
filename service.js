var freebase = require('freebase');
var freebase_service = freebase.service;
var freebase_client_manager = freebase.client;
var docker_manager = require('./lib/docker_manager');
var config = require('./config');


docker_manager.initialize(config.docker, function(e){

	freebase_service.initialize(
		config
	,
	function(e){
		if (!e){

			console.log('server initialized');

			freebase_client_manager.newClient({host:'localhost', port:config.port, secret:config.services.auth.systemSecret}, function(e, freebase_client){

				if (e){
					console.log('Failed to create internal client: ' + e);
					process.end(1);
				}
					
				freebase_client.on('/docker_cloud/event', 'POST', 0, function(e, message){

				console.log('docker cloud event happened with message id: ' + message._id);
				//console.log(message);
					
				if (!e){

					docker_manager.process(message.data, function(e, result){

							var result_wrapper = {status:'ok', data:result};

							if (e){
								result_wrapper.status = 'error';
								result_wrapper.message = e;
							}
								
							freebase_client.put('/docker_cloud/result/' + message.data.name, result_wrapper, function(e, result){

								if (!e)
									console.log('successfully posted result for message id: ' + message.data.name);
								else
									console.log('failure posting result for message with id: ' + message.data.name + ', error: ' + e);

							});
						});
					}

				}, function(e){

					if (!e){
						console.log('Up and listening to docker events on port ' + config.port);
					}else{
						console.log('Failed to listen to docker events');
						process.end(1);
					}
						
				});

			});

			
		}
		else{
			console.log('Failed to initialize freebase service: ' + e);
			process.end(1);
		}
	});

});



