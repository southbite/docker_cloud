var expect = require('expect.js');
var freebase = require('freebase');
var freebase_client = freebase.client;
var config  = require('./config');

describe('e2e test', function() {

	var publisherclient;
	var listenerclient;


	it('should initialize the clients', function(callback) {
		
		this.timeout(5000);

		try{

			freebase_client.newClient({host:'localhost', port:config.port, secret:config.services.auth.systemSecret}, function(e, client){

				publisherclient = client;


				if (e)
					return callback(e);

				freebase_client.newClient({host:'localhost', port:config.port, secret:config.services.auth.systemSecret}, function(e, client){

					listenerclient = client;

					callback(e);
				});


			});

		}catch(e){
			callback(e);
		}
	});



	it('the publisher should set a docker operation ', function(callback) {
		
		this.timeout(15000);

		try{

			//var container_name = require('shortid').generate();

			var container_name = 'test_freebase_2';

			publisherclient.on('/docker_cloud/result/' + container_name, 'PUT', 1, function(e, message){

				console.log('on result happened');
				console.log(message);
				console.log(message.data.data.Ports[0]);
				
				console.log('ok - lets post a message to this instance of our freebase');

				//we need a delay - as the server hasnt finished spinning up
				setTimeout(function(){

					freebase_client.newClient({host:'localhost', port:message.data.data.Ports[0].PublicPort, secret:config.services.auth.systemSecret}, function(e, container_client){

						if (!e)
						{
							console.log('we are connected to our instance');

							container_client.post('/test/blah', {property1:'property1'}, function(e, result){

								if (!e)
									console.log(result);

								callback(e);

							});

						}else
							callback(e);

					});

				}, 5000);

				
				

			}, function(e){

				console.log('ON HAS HAPPENED: ' + e);

				if (!e){

					publisherclient.post('/docker_cloud/event', {action:'start', image:'simon/freebase:latest', name:container_name, port:8080}, function(e, result){

						console.log('post happened');
						console.log(e);
						console.log(result);
					
						if (!e){
							console.log('we are expecting some kind of result');
						}else
							callback(e);
						
					});

				}else
					callback(e);
			});


			

		}catch(e){
			callback(e);
		}
	});
	
});