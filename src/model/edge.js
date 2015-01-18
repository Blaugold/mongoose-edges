

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var edgeSchema = new Schema({
    src: {
        type: Schema.Types.ObjectId,
        required: true
    },
    dest: {
        type: Schema.Types.ObjectId,
        required: true
    },
    uniqueIndex: {
        type: String,
        required: true,
        unique: true
    },
    props: {
        type: Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Edge', edgeSchema);