module.exports = function () {
  bot.on("registered", function (data) {
    if (config.verboseLogging) {
      console.log("[JOIN]", JSON.stringify(data, null, 2));
    }

    data.user.forEach(function (user) {
      if (user.name === undefined) {
        console.log(`[JOIN] Guest joined`);
      }

      if (user.userid !== config.auth.userId) {
        
        var newUser = false;
        var message = "";

        getDbUserFromUserId(user.userid, function (dbUser) {
          if (dbUser == null) {
            newUser = true;
            message = config.responses.welcome.newUser.replace("{username}", user.name);
            if (!roomHasActiveStaff) {
              message += " Type .help if you need it!";
            }
            models.RoomEvent.findOne({
              where: {
                starts_at: { lte: new Date() },
                ends_at: { gte: new Date() },
              },
            }).then(function (event) {
              if (event !== null) {
                if (event.type == "event") {
                  message += " :star: SPECIAL EVENT :star: " + event.title + " (.event for details)";
                } else if (event.type == "theme") {
                  message += " Theme: " + event.title + " (.theme for details)";
                }
              }

              console.log("[JOIN]", user.name + " is a first-time visitor to the room!");
              if (config.welcomeUsersMinLevel <= user.points && (config.welcomeUsers == "NEW" || config.welcomeUsers == "ALL")) {
                setTimeout(function () {
                  bot.speak(message);
                }, 5000);
              }
            });
          } else {              
            models.EventResponse.findOne({
              where: { event_type: "userJoin", pattern: user.name, is_active: true },
              order: models.sequelize.random()
            })
              .then(function (eventResponse) {
                if (eventResponse == null) {
                  message = config.responses.welcome.oldUser.replace("{username}", user.name);
                } else {
                  message = eventResponse.response.replace("{username}", user.name);
                }
              })
              .then(function () {
                models.RoomEvent.findOne({
                  where: {
                    starts_at: { lte: new Date() },
                    ends_at: { gte: new Date() },
                  },
                }).then(function (event) {
                  if (event !== null) {
                    if (event.type == "event") {
                      message += " :star: SPECIAL EVENT :star: " + event.title + " (.event for details)";
                    } else if (event.type == "theme") {
                      message += " Theme: " + event.title + " (.theme for details)";
                    }
                  }

                  if (message && config.welcomeUsersMinLevel <= user.points && config.welcomeUsers == "ALL" && secondsSince(dbUser.last_active) >= 900 && secondsSince(dbUser.last_seen) >= 900) {
                    setTimeout(function () {
                      bot.speak(message);
                    }, 5000);
                  }

                  console.log("[JOIN]", user.name + " last seen " + timeSince(dbUser.last_seen));
                });
              });              
          }

          // Restore spot in line if user has been gone < 15 mins
          var position = getWaitListPosition(user.userid);

          /*
          if (!newUser && dbUser.queue_position > -1 && secondsSince(dbUser.last_seen) <= 900 && (position === -1 || (position > -1 && position > dbUser.queue_position))) {
            bot.moderateAddDJ(user.id, function () {
              if (dbUser.queue_position < bot.getWaitList().length && position !== dbUser.queue_position) {
                bot.moderateMoveDJ(user._id, dbUser.queue_position);
              }

              var userData = {
                type: "restored",
                details: "Restored to position " + dbUser.queue_position + " (disconnected for " + timeSince(dbUser.last_seen, true) + ")",
                user_id: dbUser.id,
                mod_user_id: botUser.db.id,
              };
              models.Karma.create(userData);

              setTimeout(function () {
                bot.speak("put @" + user.name + " back in line (reconnected after " + timeSince(dbUser.last_seen, true) + ") :thumbsup:");
              }, 5000);
            });
          }
          */
        });
        updateDbUser(user);
      }
    });
  });
};
