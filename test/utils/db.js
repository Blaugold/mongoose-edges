
var mongoose = module.exports.mongoose = require('mongoose');

module.exports.connect = function (done) {
    if (process.env.RUN_ENV == 'travis') {
        mongoose.connect("mongodb://127.0.0.1/test",
            function (err) {
                done(err);
            });
    } else {
        // Connect to mongoDB using env variables set because container
        // running mongod is linked to container running the tests
        mongoose.connect("mongodb://" +
            process.env.MONGO_PORT_27017_TCP_ADDR + ":" +
            process.env.MONGO_PORT_27017_TCP_PORT + "/test",
            function (err) {
                done(err);
            });
    }
}

module.exports.disconnect = function (done) {
    // Disconnect mongoose connection
    mongoose.disconnect(function (err) {
        done(err);
    });
}
