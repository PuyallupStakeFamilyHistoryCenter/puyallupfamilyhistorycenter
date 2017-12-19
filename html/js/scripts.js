"use strict";

var idx, max, personsArray;
var fs = new FamilySearch({

  // Specify the FamilySearch reference environment that will be used. Options 
  // are: 'production', 'beta', and 'integration'. Defaults to 'integration'.
  environment: 'sandbox',

  // App keys are obtained by registering you app in the FamilySearch developer's center.
  // https://familysearch.org/developers/docs/guides/gs1-register-app
  appKey: 'a02j000000LsAI0AAN',

  // Required when using OAuth.
  // https://familysearch.org/developers/docs/guides/authentication
  redirectUri: 'http://34.214.220.226/rooms/',

  // Save the access token in a cookie and load if from a cookie so that the
  // session isn't lost when the page reloads or changes. Defaults to false.
  // Use the `tokenCookie` option to change the name of the cookie.
  saveAccessToken: true,

  // Name of the cookie where the access token will be stored when `saveAccessToken`
  // is set to `true`. Defaults to 'FS_AUTH_TOKEN'.
  tokenCookie: 'FS_AUTH_TOKEN',

  // Maximum number of times that a throttled request will be retried. Defaults to 10.
  maxThrottledRetries: 10,
  
  // Optional settings that enforces a minimum time in milliseconds (ms) between
  // requests. This is useful for smoothing out bursts of requests and being nice
  // to the API servers. When this parameter isn't set (which is the default)
  // then all requests are immediately sent.
  requestInterval: 1000
});

function fsCheckImg(){
	if(idx < max){
		fs.get('/platform/tree/persons/' + personsArray[idx].id + '/memories?type=Photo&count=1', function(error, response){
			if(error){
		    	console.log('Network error');
			} 
		
			else if(response.statusCode >= 500){
				console.log('Server error');
			}
		  
			else if(response.statusCode >= 400){
				console.log('Bad request');
			}
			else {
				if(response.statusCode == 200 && response.data.sourceDescriptions.length > 0){
					$("#discovery_room_modal #status_media").prepend('<span uk-icon="icon: check"></span>').addClass('uk-alert-success');
					$("#discovery_room_modal .modal-status").first().html('<div class="uk-margin-right" uk-spinner></div>Looking good! Preparing scheduler...');
					setTimeout(function(){
						$("#discovery_room_modal .status-icons").first().addClass('uk-hidden');
						$("#discovery_room_modal .modal-status").first().addClass('uk-hidden');
						$("#discovery_room_scheduler").removeClass('uk-hidden');
					}, 1000);
				} else {
					idx = idx + 1;
					fsCheckImg();
				}
			}
		});
	} 
	else if(idx == max){
		fs.get('/platform/tree/persons/' + personsArray[idx].id + '/memories?type=Photo&count=1', function(error, response){
			if(error){
		    	console.log('Network error');
			} 
		
			else if(response.statusCode >= 500){
				console.log('Server error');
			}
		  
			else if(response.statusCode >= 400){
				console.log('Bad request');
			}
			else {
				if(response.statusCode == 200 && response.data.sourceDescriptions.length > 0){
					$("#discovery_room_modal #status_media").prepend('<span uk-icon="icon: check"></span>').addClass('uk-alert-success');
					$("#discovery_room_modal .modal-status").first().html('<div class="uk-margin-right" uk-spinner></div>Looking good! Preparing scheduler...');
					setTimeout(function(){
						$("#discovery_room_modal .status-icons").first().addClass('uk-hidden');
						$("#discovery_room_modal .modal-status").first().addClass('uk-hidden');
						$("#discovery_room_scheduler").removeClass('uk-hidden');
					}, 1000);
				} else {
					idx = idx + 1;
					$("#discovery_room_modal #status_media").prepend('<span uk-icon="icon: close"></span>').addClass('uk-alert-danger');
				    $("#discovery_room_modal .modal-status").first().html('Uh oh. You do not have sufficient media. You need at least 1 photo for an ancestor in FamilySearch.').removeClass('uk-hidden');
				}
			}
		});
	}
	else{
		// Do Nothing...
	}
}

function fsReadinessCheck(){
	$("#discovery_readiness_intro").addClass('uk-hidden');
	$("#discovery_room_modal .status-icons").first().removeClass('uk-hidden');
	$("#discovery_room_modal .modal-status").first().html('<div class="uk-margin-right" uk-spinner></div>Verifying Login...').removeClass('uk-hidden');

	fs.get('/platform/users/current', function(error, response){ 
		if(error){
	    	console.log('Network error');
	    	console.log(error);
		} 
	
		else if(response.statusCode >= 500){
			console.log('Server error');
		}
	  
		else if(response.statusCode >= 400){
			console.log('Bad request');
		}
	  
		else {
			$("#discovery_room_modal #status_login").prepend('<span uk-icon="icon: check"></span>').addClass('uk-alert-success');
			$("#discovery_room_modal #status_tree").removeClass('uk-text-muted');
			$("#discovery_room_modal .modal-status").first().html('<div class="uk-margin-right" uk-spinner></div>Checking family tree depth...').removeClass('uk-hidden');
	    	
	    	fs.get('/platform/tree/ancestry?person=' + response.data.users[0].personId + '&generations=5', function(error, response){
		    	if(error){
			    	console.log('Network error');
				} 
			
				else if(response.statusCode >= 500){
					console.log('Server error');
				}
			  
				else if(response.statusCode >= 400){
					console.log('Bad request');
				}
				
				else {
			    	if(response.data.persons.length >= 8){
				    	$("#discovery_room_modal #status_tree").prepend('<span uk-icon="icon: check"></span>').addClass('uk-alert-success');
						$("#discovery_room_modal #status_media").removeClass('uk-text-muted');
						$("#discovery_room_modal .modal-status").first().html('<div class="uk-margin-right" uk-spinner></div>Checking family tree media...').removeClass('uk-hidden');
						
						idx = 0;
						max = Math.min(response.data.persons.length, 15);
						personsArray = response.data.persons;
						
						fsCheckImg();
			    	} else{
				    	$("#discovery_room_modal #status_tree").prepend('<span uk-icon="icon: close"></span>').addClass('uk-alert-danger');
				    	$("#discovery_room_modal .modal-status").first().html('Uh oh. You do not have sufficient ancestry. You need at least 5 generations in FamilySearch.').removeClass('uk-hidden');
			    	}
			    }
	    	});
		}
	});
}

$(document).ready(function(){
	$("#discovery_room_modal").on('show', function(){
		if(fs.getAccessToken()){
			fsReadinessCheck();
		} else {
			$("#discovery_readiness_intro").removeClass('uk-hidden');
		}
	});
	
	$("#discovery_room_modal").on('hide', function(){
		$("#discovery_room_modal .modal-status").html('');
		$("#discovery_room_modal .status-icons .uk-alert-success").removeClass('uk-alert-success').find('span.uk-icon').remove();
		$("#discovery_room_scheduler").addClass('uk-hidden');
	});
	
	fs.oauthResponse(function(){
		if(fs.getAccessToken()){
			UIkit.modal('#discovery_room_modal').show();
		}
	});
});