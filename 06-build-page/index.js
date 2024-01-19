const fs = require('fs');
const path = require('path');

const compFolder = path.join(__dirname, 'components');
const stylesFolder = path.join(__dirname, 'styles');
const saveFolder = path.join(__dirname, 'project-dist');
const assetsFolder = path.join(__dirname, 'assets');
const newFolder = path.join(saveFolder, 'assets');

const comp = {};

async function readDir(dir) {
  const files = await fs.promises.readdir(dir, {
    withFileTypes: true,
  });

  return files;
}

function readFileAsync(pathFile, filename) {
  return new Promise((res, rej) => {
    fs.readFile(pathFile, 'utf8', (err, data) => {
      if (err) rej(err);
      else
        res({
          file: filename,
          data: data,
        });
    });
  });
}

async function createIndex() {
  // get components
  const promises = [];
  const compFiles = await readDir(compFolder);

  compFiles.forEach((file) => {
    if (file.isDirectory()) return;

    const pathFile = path.join(compFolder, file.name);
    const ext = path.extname(pathFile).slice(1).toLowerCase();
    const filename = path.parse(pathFile).name;

    if (ext === 'html') {
      promises.push(readFileAsync(pathFile, filename));
    }
  });

  await Promise.all(promises).then((results) => {
    results.forEach((d) => {
      if (d) {
        comp[d.file] = d.data;
      }
    });
  });

  // read template.html
  let { data: content } = await readFileAsync(
    path.join(__dirname, 'template.html'),
    'template',
  );

  Object.keys(comp).forEach((key) => {
    content = content.replaceAll(`{{${key}}}`, comp[key]);
  });

  const indexSave = fs.createWriteStream(path.join(saveFolder, 'index.html'));
  indexSave.write(content);
  console.log('Файл index.html собран!');
}

async function mergeStyles() {
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
        const filename = path.parse(pathFile).name;

        if (ext === 'css') promises.push(readFileAsync(pathFile, filename));
      });

      const StyleSave = fs.createWriteStream(
        path.join(saveFolder, 'style.css'),
      );

      Promise.all(promises).then((results) => {
        results.forEach((d) => {
          if (d) {
            StyleSave.write(`${d.data}\n\r`);
          }
        });
        console.log('Файл style.css собран!');
      });
    },
  );
}

async function copyDirs(dir) {
  const files = await readDir(dir);

  files.forEach(async (file) => {
    const source = path.join(dir, file.name);
    const relativePath = path.relative(assetsFolder, source);
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

async function runBuild() {
  await createIndex();
  await mergeStyles();
  await copyDirs(assetsFolder).then(() =>
    console.log('Папка assets с файлами скопированна!'),
  );
}

function main() {
  fs.access(newFolder, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdir(
        newFolder,
        {
          recursive: true,
        },
        (err) => {
          if (err) {
            console.log(err);
            return;
          }
          runBuild();
        },
      );
    } else {
      fs.rm(
        newFolder,
        {
          recursive: true,
        },
        (err) => {
          if (err) {
            console.log(err);
            return;
          }

          fs.mkdir(
            newFolder,
            {
              recursive: true,
            },
            (err) => {
              if (err) {
                console.log(err);
                return;
              }
              runBuild();
            },
          );
        },
      );
    }
  });
}

main();
