const mongoose = require('mongoose');

const GoogleTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  create_At: {
    type: Date,
    default: Date.now(),
  },
  update_At: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('GoogleTolen', GoogleTokenSchema);
