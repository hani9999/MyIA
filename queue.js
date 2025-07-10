// queue.js
const MAX_CONCURRENT = 5;
const queue = [];
let active = 0;

function runNext() {
  if (active >= MAX_CONCURRENT || queue.length === 0) return;

  const { task, resolve, reject } = queue.shift();
  active++;

  task()
    .then(result => resolve(result))
    .catch(err => reject(err))
    .finally(() => {
      active--;
      runNext();
    });
}

exports.enqueue = function (task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    runNext();
  });
};
