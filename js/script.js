/* 	Author: Benjamin J. Balter 
	National Broadband Map Web App Proof of Concept
*/
$(document).ready(function() {

	/**
	 * Success Callback for location API
	 * Takes geoposition object
	 */
	function successCallback(pos) {
		log("Latitude: " + pos.coords.latitude + " , Longitude: " + pos.coords.longitude );
		getWireless( pos );
		getCensus( pos );
	  }

	/**
	 * Error handling for location API
	 */
	function errorCallback (err) {
	  switch(err.code) {
		case 1:
		  error("It looks like this application does not have the proper permission to detect your location");
		  break;
		case 2:
		  error("A problem happened while trying to get your location");
		  break;
		case 3:
		  error("Getting your location was taking too long... perhaps you should invest in broadband?");
		  break;
		default:
		  error("An unknown error has occured");
	  }
	}

	/**
	 * Modal dialog error handler
	 */
	function error( error ) {
		$('#error').html( error );
		$('#errorDialog').modal({close: false, autoResize: true});
	}

	/**
	 * Retrives wireless providers for a given position
	 */
	function getWireless( pos ) {
		var speedCodes = new Array();
		speedCodes[2] = '200 <span class="unit">kbps</span> - 768 <span class="unit">kbps</span>';
		speedCodes[3] = '768 <span class="unit">kbps</span> - 1.5 <span class="unit">mbps</span>';
		speedCodes[4] = '1.5 <span class="unit">mbps</span> - 3 <span class="unit">mbps</span>';
		speedCodes[5] = '3 <span class="unit">mbps</span> - 6 <span class="unit">mbps</span>';
		speedCodes[6] = '6 <span class="unit">mbps</span> - 10 <span class="unit">mbps</span>';

		$('#wireless .loader').fadeIn();
		$.ajax({
			  url: 'http://www.broadbandmap.gov/broadbandmap/broadband/jun2011/wireless',
			  dataType: 'jsonp',
			  data: {format: 'jsonp', latitude: pos.coords.latitude, longitude: pos.coords.longitude},
			  success: function( data ) { 
log(data);
		  		$('#wireless .loader').hide();

				//loop through results and add them to the UL
				for ( i in data.Results.wirelessServices ) {
					var provider = '';
					provider = '<li>';
					if ( data.Results.wirelessServices[i].providerURL != '' )
						provider += '<a href="' + data.Results.wirelessServices[i].providerURL + '">';
					provider += data.Results.wirelessServices[i].providerName;
					if ( data.Results.wirelessServices[i].providerURL != '' )
						provider += '</a>';
					provider += ' <span class="speeds">(<span class="up code-' + data.Results.wirelessServices[i].technologies[0].maximumAdvertisedDownloadSpeed + '">';
					provider += speedCodes[ data.Results.wirelessServices[i].technologies[0].maximumAdvertisedDownloadSpeed ];
					provider += '</span> up, <span class="down code-' + data.Results.wirelessServices[i].technologies[0].maximumAdvertisedUploadSpeed + '">';
					provider += speedCodes[ data.Results.wirelessServices[i].technologies[0].maximumAdvertisedUploadSpeed ];					
					provider += '</span> down)</span>';
 					provider += '</li>'; 
					$('#wireless').append( provider );
				}

			}
		});
	}
	
	/**
	 * Queries census API to get FIPS code to use as GeographyID
	 */
	function getCensus( pos ) {
		$.ajax({
			  url: 'http://www.broadbandmap.gov/broadbandmap/census/county',
			  dataType: 'jsonp',
				data: {format: 'jsonp', latitude: pos.coords.latitude, longitude: pos.coords.longitude},
				success: function( data ) {
				
					//pass geography ID along to the various functions
					updateLoc( data['Results']['county'][0]['name'] );
					//stateRank( data['Results']['county'][0] );
					nationalRank( data['Results']['county'][0] );
					
			  }
		});
	}
		
	/**
	 * Retrieves user's county's rank nationally
	 */
	function nationalRank( census ) {
		$.ajax({
			  url: 'http://www.broadbandmap.gov/broadbandmap/almanac/jun2011/rankby/nation/population/downloadSpeedGreaterThan3000k/county/id/' + census['fips'],
			  dataType: 'jsonp',
			  data: {format: 'jsonp' },
			  success: function( data ) { 
log(data);
				  $('#national-rank .loader').hide();
					
					//loop through data, format an li and add to the ol
					for ( i in data.Results.myArea ) {
						
						var rank = '';
						rank = '<li';
						
						//if this is the user's locality, append a class to format acordingly
						if ( i == 5) 
							rank += ' class="me"';
						
						rank += '>';
						rank += data.Results.myArea[i].geographyName;
						rank += '</li>';
						$('#national-rank').append( rank );
					
					}
					//modify ol's CSS so rankings are accurately displayed
					$('#national-rank').css('counter-reset', 'item ' + ( data.Results.myArea[0].rank - 1 ) );

			}
		});
	}
	
	/**
	 * Updates the location name
	 */
	function updateLoc( loc ) {
		$('.loc').html(' in ' + loc );
	}
	
	/**
	 *  Get's vistor's position on load, if possible, otherwise errors out
	 */
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
	} else {
		error('Sorry, your browser does not support geolocation');
	}

});
