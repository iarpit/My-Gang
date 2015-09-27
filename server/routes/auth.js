var loopback = require('loopback');
module.exports = function(app) {
    app.post('/auth/signup', function (req, res, next) {
      var User = app.models.user;

      var newUser = {};
      newUser.email = req.body.email.toLowerCase();
      newUser.name = req.body.name.trim();
      newUser.password = req.body.password;
      newUser.phone = req.body.phone;

      User.create(newUser, function (err, user) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('/?failure=signup');
        } else {
          olaLogin(req,res,user)
        }
      });
    });

    app.get('/team95', function (req,   res, next) {
        res.render('pages/wait');
    });

    app.get('/auth/ola', function (req, res, next) {
        var User = app.models.user;
        User.findById(req.cookies.userId, function(err, user) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('back');
            } else {
                user.access_token = req.body.access_token;
                user.save(function (err) {});
            }
        });
        res.redirect("/");
    });

    function olaLogin(req,res,user){
        req.login(user, function (err) {
          if (err) {
            console.log(err.message);   
            req.flash('error', err.message);
            return res.redirect('back');
          }else{
            res.cookie('userId',user.id)
            syncFetchOLAToken(res);
          }
        });
    }

    function syncFetchOLAToken(res,next){
        var url = "http://sandbox-t.olacabs.com/oauth2/authorize?";
        url = url + "response_type=token";
        url = url + "&client_id=MTM4MTE2ZDItNzY5Ni00MThhLTlkYTItNjg3MWRiNmQ0ZTY4";
        url = url + "&redirect_uri=http://localhost/team95"
        url = url + "&scope=profile%20booking"
        url = url + "&state=state123"
        res.redirect(url);
    }
}