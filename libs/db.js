var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;

connect();

function connect() {
    var url = "mongodb://127.0.0.1/ims";
    mongoose.connect(url, function(err) {
    if (err) console.log(err);
    else console.log('DB success');
    });
}

function disconnect() {
    mongoose.disconnect();
}