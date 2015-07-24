 /*!
 * Twitter Sentiment Map v1.1
 * By Decoded for Data in a Day (http://decoded.com)
 *
 *
 * Copyright 2014 Decoded
 * Released under the MIT license
 *
 *
 */

 // Change the way you want your visualisation to look

// This is what a positive tweet will look like
var positiveColour = "rgb(254, 248, 0)";
var positiveStrength = 0.8;
var positiveSize = 20;

// This is what a neutral tweet will look like
var neutralColour = "rgb(255, 255, 255)";
var neutralStrength = 0.8;
var neutralSize = 20;

// This is  what a negative tweet will look like
var negativeColour = "rgb(0, 0, 0)";
var negativeStrength = 0.8;
var negativeSize = 20;


// Probably no need to edit past this point

// Define an object to check for duplicates
var duplicate = [];


function getTweets(latitude, longitude, radius, update, sentiment) {
  // Make a request to our live twitter JSON stream
  $.ajax({url: "http://twitter.decoded.com/tweets.php?callback=decoded", jsonp: "callback", dataType: "jsonp", success: function (data) {

    // For each of the tweets, split out their individual information

      $.each(data, function( i, item ) {

        // This is information that is stored in the meta information of each tweet
        var screenName = item['screen_name'];
        var tweet = item['tweet'];
        var lat = item['lat'];
        var lng = item['lng'];
        var time = item['timestamp'];

        // Calculate the distance between our target, and where the tweet was tweeted
        var distance = getDistanceFromLatLonInKm(lat, lng, latitude, longitude);

        // Check to see if this tweet has already been mapped
        var count = duplicate.indexOf(lat);

          // If the tweet hasn't been mapped already, then continue
          if (count < 0) {

            // Add this tweet to the duplicate log so we don't map it again
            duplicate.push(lat);

            // If the distance is less than our radius, then map this tweet! (IN KM)
            if (distance < radius) {
                        // Add the marker. If we want sentiment analysis then add it
                        addMarker(lat,lng,tweet,sentiment);
                        // Log the tweet to the console for further analysis
                        console.log(tweet)
                        }
            }

        });
  }});

  // If update, set this function to run again
  if (update != undefined) {
    setTimeout(function() { getTweets(latitude, longitude, radius, "yes", sentiment) }, 2000);
  }
}


function addMarker(lat, lng, tweet, sentiment) {

  // Check to see if we want to do any sentiment analysis
    if (sentiment != undefined) {
      // Use our API to get a number
      $.ajax({url: "http://sentiment.decoded.com/api/"+sentiment+"/?txt="+encodeURIComponent(tweet), jsonp: "callback", dataType: "jsonp", success: function (data) {
          keepGoing(tweet, data.result.sentiment);
        }
      });
    }
    // If we don't want sentiment, just continue
    else
    {
      keepGoing(tweet);
    }

    // Once we have the tweet and sentiment, we can define the way the markers look
    function keepGoing(tweet, sentiment) {

      // Define our mood icons
      if (sentiment != undefined) {

        // If the sentiment is positive, create this sort of marker
        if (sentiment == 'Positive') {
          var theIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: positiveSize,
          fillOpacity: positiveStrength,
          fillColor: positiveColour,
          strokeWeight: 0
          }
        }

        // If the sentiment is neutral, create this sort of marker
        else if (sentiment == 'Neutral') {
          var theIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: neutralSize,
          fillOpacity: neutralStrength,
          fillColor: neutralColour,
          strokeWeight: 0
          }
        }

        // If the sentiment is negative, create this sort of marker
        else if (sentiment == 'Negative') {
          var theIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: negativeSize,
          fillOpacity: negativeStrength,
          fillColor: negativeColour,
          strokeWeight: 0
          }
        }
        // If we are doing sentiment analysis, create this sort of marker
      var marker = new google.maps.Marker({
        // Set the position of the marker
        position: new google.maps.LatLng(lat, lng),
        // Put the marker on a Google map
        map: map,
        icon: theIcon
      });
      }
      // If we're not doing sentiment analysis, create this sort of marker
      else {
      var marker = new google.maps.Marker({
        // Set the position of the marker
        position: new google.maps.LatLng(lat, lng),
        // Put the marker on a Google map
        map: map
      });
      }


      // Create an info window with the contents of this tweet
      var infowindow = new google.maps.InfoWindow({
        content: tweet
      });
      // Listen for when someone clicks on a marker
      google.maps.event.addListener(marker, 'click', function() {
        // When someone does click, open the info window
        infowindow.open(map,marker);
      });
    }
  }


// Function to calculate distance - from Code in a Day!
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// Pull in jQuery
  var script = document.createElement('script');
  script.src = '/public/js/jquery-1.9.1.min.js';
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);