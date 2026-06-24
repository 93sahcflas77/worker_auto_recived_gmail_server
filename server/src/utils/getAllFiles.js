const fs = require("fs").promises;
const path = require("path");

module.exports = async (dir) =>  {
    const items = await fs.readdir(dir);

    const files = await Promise.all(
        items.map(async (item) => {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                return getAllFiles(fullPath);
            }

            return fullPath;
        })
    );

    return files.flat(Infinity);
}