const config = require('../config/env');
const { google } = require('googleapis');

module.exports = async (refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    config.GOOGLE.clientId,
    config.GOOGLE.clientSecret,
    config.GOOGLE.redirectUris,
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
};
