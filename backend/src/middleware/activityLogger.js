const { createActivity } = require("../services/activityService");

const activityLogger = () => (req, res, next) => {
  res.on("finish", async () => {
    const actor = req.user || res.locals.activityUser;

    if (res.statusCode < 200 || res.statusCode >= 300 || !res.locals.activity || !actor) {
      return;
    }

    try {
      await createActivity({
        userId: actor._id,
        userName: actor.name,
        ip: req.ip,
        timestamp: new Date(),
        ...res.locals.activity,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Activity logging failed", error.message);
    }
  });

  next();
};

module.exports = activityLogger;
