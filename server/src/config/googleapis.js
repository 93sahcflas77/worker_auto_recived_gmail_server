const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const logger = require("../utils/logger");

const CREDENTIALS_PATH = path.join(process.cwd(), "./credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "./token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive"
];

async function createOAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    logger.error(`credentials.json not found at ${CREDENTIALS_PATH}. Download from Google Cloud Console.`)
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  // Support both "installed" and "web" type credentials
  const data = credentials.installed || credentials.web;
  if (!data) {
    logger.error("Invalid credentials.json: expected 'installed' or 'web' field.")
  }

  const { client_id, client_secret, redirect_uris } = data;

  const client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris && redirect_uris.length ? redirect_uris[0] : undefined
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    client.setCredentials(token);
  }

  return client;
}

const getGmailClient = async () => {
  const auth = await createOAuthClient();
  return google.gmail({
    version: "v1",
    auth
  })
}

const getDriveClient = async () => {
  const auth = await createOAuthClient();
  return google.drive({
    version: "v3",
    auth
  })
}

module.exports = { getGmailClient, TOKEN_PATH, createOAuthClient, SCOPES, getDriveClient }














