var models = require('/Users/sethiaa/Github/My-Gang/server/server.js').models;
var distance = require('google-distance-matrix');
var duration;

module.exports = function(Event) {

Event.accept = function(data, callback) {
	var Booking = models.Booking;
	// console.log(Booking);
	event_id = data.event_id;
	user_id = data.user_id;
	currentLocation = data.locate
	if (typeof(user_id) == 'undefined' || typeof(event_id) == 'undefined' || typeof(locate) == 'undefined') {
		var err = new Error('user_id, locate and event_id should be set in post body');
	        err.statusCode = 404;
	        callback(err);
	        return;
	}
	Event.findById(event_id, function(err, currentEvent) {
		if (err) {
			callback(err);
		} else if (currentEvent == null) {
			var err = new Error('Event does not exist');
	        err.statusCode = 404;
	        callback(err);
		} else {
			if (currentEvent.invitee_list.indexOf(user_id) >= 0) {
				currentEvent.invitee_list.splice(currentEvent.invitee_list.indexOf(user_id), 1);
			}
			if (currentEvent.accepted_list.indexOf(user_id) < 0) {
				currentEvent.accepted_list.push(user_id);
			}
			var origins = [currentLocation];
			var destinations = [currentEvent.venue];
			distance.matrix(origins, destinations, onMatrix);
			// var currentSeconds = Date.parse(currentBooking.booking_time).getTime()/1000;
			var book_time = currentEvent.date - duration - (1200);
			Booking.findOrCreate({auth_token : user_id},
								 {auth_token : user_id, booking_time : book_time, locate : currentLocation},
								 function(err, booking) {
				if (err) {
					callback(err);
				}
			});
		}
	});
};

Event.remoteMethod(
    'accept',
    {
      description: 'Tell server if user has accepted invite',
      accepts: [
        { arg: 'data', type: 'object', required: true, http: { source:'body'} },
      ],
      returns: {
        http: {verb: 'post'}
      }
    }
  );

Event.sendEmail = function(email, cb) {
    Event.app.models.Email.send({
      to: email,
      from: 'mygangabc@gmail.com',
      subject: 'my subject',
      text: 'my text',
      html: 'my <em>html</em>'
    }, function(err, mail) {
      console.log('email sent!');
      cb(err);
    });
};

Event.observe('after save', function(ctx, next) {
    if (ctx.instance) {
      console.log('About to save a car instance:', ctx.instance);
    } else {
      console.log('About to update cars that match the query %j:', ctx.where);
    }

    for (var i = 0; i < ctx.Model.invitee_list; ++i) {
    	Event.sendEmail(ctx.Model.invitee_list[i], function(err){});
    }
    
    next();
  });
};

function onMatrix(err, distances) {
    if (err) {
        return console.log(err);
    }
    if(!distances) {
        return console.log('no distances');
    }
    if (distances.status == 'OK') {
        // for (var i=0; i < origins.length; i++) {
            // for (var j = 0; j < destinations.length; j++) {
                var origin = distances.origin_addresses[0];
                var destination = distances.destination_addresses[0];
                if (distances.rows[0].elements[0].status == 'OK') {
                    var distance = distances.rows[0].elements[0].distance.text;
                    var time=distances.rows[0].elements[0].duration.text;
                    duration = distances.rows[0].elements[0].duration.value;
                    // console.log(duration);
                    // console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance+ 'and duration= '+time);
                } else {
                    console.log(destination + ' is not reachable by land from ' + origin );
                }
            // }

        // }

    }
}