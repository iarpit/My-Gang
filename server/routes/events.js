var loopback = require('loopback');
module.exports = function(app) {
    app.get('/events', function (req, res, next) {
      var User = app.models.user;
      var Event = app.models.event;
      var userEvents = []
      var user;
      User.findById(req.cookies.userId, function(err, _user) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('back');
            } else {
                user = _user;
            }
        });
      Event.find({ where: {inviter_id:req.cookies.userId} }, function(err, events){
        userEvents = events;
      });
      console.log(userEvents);
      res.render('pages/events', {
        events: userEvents,
        user: user
      });
      
    });
}