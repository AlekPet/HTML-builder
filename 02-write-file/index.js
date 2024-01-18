const fs = require('fs');
const path = require('path');
const file = fs.createWriteStream(path.join(__dirname, 'text.txt'));

const { stdin, stdout } = process;

const readline = require('readline');
const rline = readline.createInterface({
  input: stdin,
  output: stdout,
});

stdout.write(
  '== Привет! Я программа, которая умеет записывать ваши данные в файл ==\n',
);
const addInFileText = () => {
  rline.question('Введите текст (или "exit" для выхода): ', (text) => {
    if (text === 'exit') {
      endProgram();
    } else {
      file.write(`${text}\n`);
      addInFileText();
    }
  });
};

function endProgram() {
  stdout.write('\n == Удачи в обучении, возвращайтесь ещё! ==');
  file.end();
  rline.close();
}

rline.on('SIGINT', endProgram);

addInFileText();
