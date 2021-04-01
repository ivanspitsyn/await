const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const del = require('del');
const paths = {
  source: null,
  dist: null
};

const argv = yargs
  .usage('Usage: node $0 [option]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('node $0 --entry [path]', 'Сортировка файлов')
  .option('entry', {
    alias: 'e',
    default: './files',
    describe: 'Путь к исходной папке',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    describe: 'Путь куда положить',
    default: '/output'
  })
  .option('delete', {
    alias: 'D',
    describe: 'Удалить исходную папку?',
    type: 'boolean',
    default: false
  })
  .epilog('Первая домашнее задание')
  .argv;
//
// -------------
//
paths.source = path.normalize(path.join(__dirname, argv.entry));
paths.dist = path.normalize(path.join(__dirname, argv.output));

const createdir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const exist = (path, callb) => {
  try {
    const status = fs.existsSync(path);
    callb(null, status);
  } catch (error) {
    callb(error, false);
  }
};

const readdir = (src) => {
  return new Promise((resolve, reject) => {
    fs.readdir(src, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
};

const getStats = (url) => {
  return new Promise((resolve, reject) => {
    fs.stat(url, (err, state) => {
      if (err) {
        reject(err);
      }
      resolve(state);
    });
  });
};

const exists = (path) => {
  return new Promise((resolve, reject) => {
    exist(path, (error, status) => {
      if (error) {
        reject(error);
      }
      resolve(status);
    });
  });
};

const copyfile = (from, to) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(from, to, (err) => {
      if (err) {
        reject(err);
      }
      console.log('file is copy', from);
      resolve();
    });
  });
};

const delfolder = async () => {
  if (argv.delete) {
    // console.log(paths.source);
    // console.log(argv.entry);
    await del([argv.entry]);
    await console.log('delete folder!', paths.source);
  }
};

const sortfiles = async (src) => {
  async function recurciveRead (src) {
    console.log('reader');
    const files = await readdir(src);
    for (let index = 0; index < files.length; index++) {
      const currentUrl = path.join(src, files[index]);
      const stats = await getStats(currentUrl);
      if (stats.isDirectory()) {
        await recurciveRead(currentUrl);
      } else {
        const pathNewDir = path.join(paths.dist, files[index][0].toUpperCase());
        const newDirStatus = await exists(pathNewDir);
        if (newDirStatus) {
          // detectFiles.push(copyfile(currentUrl, path.join(pathNewDir, files[index])));
          await copyfile(currentUrl, path.join(pathNewDir, files[index]));
        } else {
          await createdir(pathNewDir);
          // detectFiles.push(copyfile(currentUrl, path.join(pathNewDir, files[index])));
          copyfile(currentUrl, path.join(pathNewDir, files[index]));
        }
      }
    }
  }

  await recurciveRead(src);
  // console.log('*************** sorting complete *************');
};

(async () => {
  try {
    await exists(paths.dist);
    await createdir(paths.dist);
    await sortfiles(paths.source);
    await console.log('*************** sorting complete *************');
    await delfolder();
  } catch (error) {
    console.log(error);
  }
})();

// ---version
// ---help
// ---axample
// ---usage
// ---option entry
// ---option output
// ---option delete (boolean)
// ---
