const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logsSchema = new Schema({
    email: {type: String, required: true},
    newslettername: {type: String, required: true},
    date: {type: Date, default: mongoose.now}
});

module.exports = mongoose.model('logs',logsSchema);