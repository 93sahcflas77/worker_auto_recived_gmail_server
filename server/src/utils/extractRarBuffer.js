const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

module.exports = async (rarBuffer, tempRarPath, outputDir) => {
    return new Promise(( resolve, reject ) => {

        // craete a outputir
        fs.mkdirSync(outputDir, {
            recursive: true
        })

        // save buffer as .rar file
        fs.writeFileSync(tempRarPath, rarBuffer);

        const unrar = spawn(
            "unrar",
            [
                "x",
                "-o+",
                tempRarPath,
                outputDir
            ]
        );

        let errorOutput = "";

        unrar.stderr.on("data", (data) => {
            errorOutput += data.toString();
        })

        unrar.on("close", (code) => {
            if(code !== 0){
                return reject (
                    new Error(
                        `UNRAR ERROR: ${errorOutput}`
                    )
                )
            }
        })

        resolve();

    })
}
