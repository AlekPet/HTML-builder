const fs = require('fs');
const path = require('path');

const stylesFolder = path.join(__dirname, 'styles');
const saveFolder = path.join(__dirname, 'project-dist');

const readFileAsync = (pathFile) => {
  return new Promise((res, rej) => {
    fs.readFile(pathFile, 'utf8', (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });
};

fs.readdir(
  stylesFolder,
  {
    withFileTypes: true,
  },
  (err, files) => {
    if (err) throw err;

    const promises = [];

    files.forEach((file) => {
      if (file.isDirectory()) return;

      const pathFile = path.join(stylesFolder, file.name);
      const ext = path.extname(pathFile).slice(1).toLowerCase();

      if (ext === 'css') promises.push(readFileAsync(pathFile));
    });

    const bundleSave = fs.createWriteStream(
      path.join(saveFolder, 'bundle.css'),
    );

    Promise.all(promises).then((results) => {
      results.forEach((data) => {
        if (data) {
          bundleSave.write(`${data}\n\r`);
        }
      });
      console.log('Файл bundle.css создан!');
    });
  },
);
