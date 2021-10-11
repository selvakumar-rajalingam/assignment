const Logs = require('../models/logs.model');

module.exports = {
    create_logs: async (logObj)=>{
        let log = new Logs(logObj);
        log.save();
    }
};