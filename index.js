//copied from http://labs.roitraining.com/labs/gcp-node-express-cloud-functions/index.html#7
var app = require('./app');

function App(req,res) {
    if (!req.url) {
        req.url = '/';
        req.path = '/';
    }
    return app(req,res);
}

var personapi = App;

module.exports = {
    personapi
};
