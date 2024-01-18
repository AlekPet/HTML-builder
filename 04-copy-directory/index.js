const fs = require('fs');
const path = require('path');
const newFolder = path.join(__dirname, 'files-copy');
const folderFiles = path.join(__dirname, 'files');

function makeDir(dir) {
  fs.mkdir(
    dir,
    {
      recursive: true,
    },
    (err) => {
      if (err) {
        return console.log(err);
      }
    },
  );
}

fs.promises
  .access(newFolder)
  .then(async () => {
    await fs.promises.rm(newFolder, { recursive: true });
    makeDir(newFolder);
  })
  .catch(() => makeDir(newFolder))
  .then(() => {
    fs.readdir(
      folderFiles,
      {
        withFileTypes: true,
      },
      (err, files) => {
        if (err) throw err;

        files.forEach((file) => {
          if (file.isDirectory()) return;
          const source = path.resolve(folderFiles, file.name);
          const dest = path.join(newFolder, file.name);

          fs.copyFile(source, dest, (err) => {
            if (err) console.log(err);
          });
        });
      },
    );
  });
