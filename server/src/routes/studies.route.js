const express = require("express");
const router = express.Router();
const Study = require("../models/study.model");



router.get("/studies", async (req, res) => {
    try {

        const data = await Study.find();

        res.send(data);

    } catch (err) {
        console.log(err);
    }
})



module.exports = router;