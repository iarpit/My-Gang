#!/usr/bin/env node
var models = require('/Users/sparshs/topcoder/My-Gang/server/server.js').models;
var Booking = models.booking;
var THRESHOLD = 1200;
cron = require('cron');
http = require('http');
var CronJob = require('cron').CronJob;

var request = require('request');

var work = function() {
	Booking.find({}, function(err, bookingArray) {
		for (var i = 0; i < bookingArray.length; ++i) {
			var currentBooking = bookingArray[i];
			var bookingTimestamp = Date.parse(currentBooking.booking_time).getTime()/1000;
			var currentTimestamp = Math.floor(Date.now() / 1000);
			var difference = currentTimestamp - bookingTimestamp;
			if (difference <= THRESHOLD && difference >= 0) {
                var authToken = currentBooking.auth_token;
                var hdrs = { 'content-type': 'text/plain',
                'connection': 'keep-alive',
                'X-APP-TOKEN': 'fea00635c360471a928af3a28b2918a3',
                'Authorization': authToken,
                'accept': '*/*' }
    		     //Lets configure and request
                request({
                    url: 'http://sandbox-t.olacabs.com/v1/bookings', //URL to hit
                    qs: {pickup_lat: currentBooking.locate.lat, pickup_lng: currentBooking.locate.lng, pickup_mode: 'NOW'}, //Query string data
                    method: 'GET', //Specify the method
                    headers: hdrs//{ //We can define headers too
                }, function(error, response, body){
                    if(error) {
                        console.log(error);
                    } else {
                        var jsonResponse = JSON.parse(response);
                        currentBooking.booking_id = jsonResponse.crn;
                        currentBooking.save(function (err) {});
                    }
                });
			}
		}
	});
};
var job = new CronJob('*/10 * * * * *', function() {
    /*
     * Runs every 5 minutes
     */

    work();

    }, function () {
      /* This function is executed when the job stops */
    },
    true /* Start the job right now */
  );
//
// keep in mind that boot scripts will be executed!
//

// do your job...


// save this script as `my-cron-job`
// chmod +x my-cron-job

