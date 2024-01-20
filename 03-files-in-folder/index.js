const fs = require('fs');
const path = require('path');
const secretFolder = path.join(__dirname, 'secret-folder');

fs.readdir(
  secretFolder,
  {
    withFileTypes: true,
  },
  (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      if (file.isDirectory()) return;
      const pathFile = path.resolve(secretFolder, file.name);

      const ext = path.extname(pathFile).slice(1);
      const filename = path.parse(pathFile).name;

      fs.stat(pathFile, (err, stats) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(
          `${filename} - ${ext} - ${(stats.size / 1024).toFixed(2)} Кб`,
        );
      });
    });
  },
);
