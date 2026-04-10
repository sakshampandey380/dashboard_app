const mongoose = require("mongoose");
const { ROLES } = require("../constants");

const settingSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: "PulseBoard",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    defaultRole: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    activityTrackingEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
