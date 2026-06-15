const express = require("express");
const gmailAuthController = require("../controller/gmailAuth.controller");
const asyncHandler = require("../utils/asyncHandler")
const router = express.Router();

router.get("/", asyncHandler(gmailAuthController.dashbord))
router.get("/auth", asyncHandler(gmailAuthController.authGmail))
router.get("/oauth2callback",  asyncHandler(gmailAuthController.oauth2callback))

// attachment/download?messageId=123456789&attachmentId=1245&fileName=chandan
// router.get("/attachment/download", asyncHandler(gmailAuthController.downloadAttachement))

module.exports = router