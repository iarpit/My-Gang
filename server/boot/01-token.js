module.exports = function(app) {
  var loopback;
  loopback = require('loopback');
  app.use(loopback.context());
  app.use(loopback.token({
    model: app.models.accessToken
  }));
  return app.use(function(req, res, next) {
    if (!req.accessToken) {
      return next();
    }
    app.models.user.findById(req.accessToken.userId, function(err, user) {
      var loopbackContext;
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new Error('No user with this access token was found.'));
      }
      loopbackContext = loopback.getCurrentContext();
      if (loopbackContext) {
        loopbackContext.set('currentUser', user);
      }
      next();
    });
  });
};