const { execFile } = require('child_process');
const util = require('util');

const exec = util.promisify(execFile);

const imageToDicom = async (input, output) => {
  await exec('img2dcm', [input, output]);
  return output;
};

const pdfToDicom = async (input, output) => {
  await exec('pdf2dcm', [input, output]);
  return output;
};

const updateDicomMetaData = async (file, fileName) => {
  await exec('dcmodify', ['-i', `(0010,0010)=${fileName}`, file]);
};

const validate = async (file) => {
  await exec('dcmdump', [file]);
};

module.exports = { imageToDicom, pdfToDicom, updateDicomMetaData, validate };
