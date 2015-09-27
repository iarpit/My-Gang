var fs = require('fs');

module.exports = function(app) {
    console.log("Loading routes...");
    var count = 1;
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        console.log(count++ + ". " + file);
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app);
    });
    console.log("Finished loading routes");

    app.get('/', function (req, res, next) {
        res.render('pages/index', {user: req.user,
                                   url: req.url,
                                   failure: req.failure
        });
    });
}