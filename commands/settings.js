exports.names = ['settings', 'set'];
exports.hidden = true;
exports.enabled = true;
exports.cdAll = 10;
exports.cdUser = 10;
exports.cdStaff = 10;
exports.minRole = PERMISSIONS.BOUNCER_PLUS;
exports.handler = function (data) {

    var input = data.message.split(' ');
    // Settings to support direct access to
    supported = ['djIdleAfterMins',
        'djIdleMinQueueLengthToEnforce',
        'djCycleMaxQueueLength',
        'maxSongLengthSecs',
        'minSongReleaseDate',
        'maxSongReleaseDate',
        'prohibitDownvoteInQueue',
        'quietMode'
    ];

    var settings = [];
    var chatMessage = "";

    if (input.length < 3) {
        for (var key in config) {
            if (config.hasOwnProperty(key) && _.contains(supported, key)) {
                chatMessage += key + ': ' + config[key] + ', ';
            }
        }
        for (var key in config.queue) {
            if (config.queue.hasOwnProperty(key) && _.contains(supported, key)) {
                chatMessage += key + ': ' + config.queue[key] + ', ';
            }
        }
        bot.sendChat('Current settings: ' + chatMessage);
    }
    else {
        var key = input[1];
        var value = _.rest(input, 2).join(' ');

        if (_.contains(supported, key)) {
            config[key] = value;
            bot.sendChat('/me set: ' + key + ' = ' + value + ' @djs');
        }
        else {
            bot.sendChat('/me unknown setting: ' + key);
        }
    }

};

