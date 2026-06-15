const fs = require("fs");
const path = require("path");
const config = require("../config/env");
const { getGmailClient, TOKEN_PATH, createOAuthClient, SCOPES } = require("../config/googleapis");
module.exports = {
    dashbord: async (req, res) => {

        let profile = null

        const hasToken = fs.existsSync(TOKEN_PATH);

        if (hasToken) {
            const gmail = await getGmailClient();
            const response = await gmail.users.getProfile({
                userId: "me"
            });
            profile = response.data
        }

        res.render("header", {
            hasToken,
            data: profile || null
        })
    },
    authGmail: async (req, res) => {
        const OAuth2lient = await createOAuthClient();

        const redirectUri = `${config.baseUrl}/oauth2callback`;

        const authUrl = OAuth2lient.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
            prompt: "consent"
        });

        res.redirect(authUrl);
    },
    oauth2callback: async (req, res) => {
        const code = req.query.code;
        if (!code) return res.status(400).send("Missing ?code");

        const oAuth2Client = await createOAuthClient();

        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Save token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf8");

        res.render("success", {
            TOKEN_PATH
        })
    },
}