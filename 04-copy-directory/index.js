const fs = require('fs');
const path = require('path');
const sourceDir = path.join(__dirname, 'files');
const newFolder = path.join(__dirname, 'files-copy');

async function readDir(dir) {
  const files = await fs.promises.readdir(dir, {
    withFileTypes: true,
  });

  return files;
}

async function copyDirs(dir) {
  const files = await readDir(dir);

  files.forEach(async (file) => {
    const source = path.join(dir, file.name);
    const relativePath = path.relative(sourceDir, source);
    const dest = path.join(newFolder, relativePath);

    if (file.isDirectory()) {
      await fs.promises.mkdir(dest, {
        recursive: true,
      });
      copyDirs(source);
    } else {
      fs.copyFile(source, dest, (err) => {
        if (err) console.log(err);
      });
    }
  });
}

fs.access(newFolder, fs.constants.F_OK, (err) => {
  if (err) {
    fs.mkdir(
      newFolder,
      {
        recursive: true,
      },
      (err) => {
        if (err) return console.log(err);
        copyDirs(sourceDir);
      },
    );
  } else {
    fs.rm(newFolder, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
      }

      fs.mkdir(
        newFolder,
        {
          recursive: true,
        },
        (err) => {
          if (err) return console.log(err);
          copyDirs(sourceDir);
        },
      );
    });
  }
});
