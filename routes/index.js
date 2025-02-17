var express = require('express');
var Task = require('../models/task');

var router = express.Router();
const cors = require('cors');
const CryptoJS = require('crypto-js');

const allowedOrigins = [
  'js-deploy-test-h4fafsheajbvczgx.koreacentral-01.azurewebsites.net'
];

const key = CryptoJS.enc.Hex.parse('12345678901234567890123456789012'); // 32바이트 키
const iv = CryptoJS.enc.Hex.parse('1234567890123456'); // 16바이트 IV
const ivForFunc = CryptoJS.enc.Hex.parse('6543210987654321'); // 16바이트 IV

const decryption = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, key, { iv : iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  return bytes.toString(CryptoJS.enc.Utf8);
};

router.use(cors({
  origin: allowedOrigins,
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
}));

router.post('/api/login', async (req, res) => {
  try {
    console.log(object);
    const decryptedUsername = decryption(username);
    const decryptedPassword = decryption(password);

    console.log(decryptedUsername, decryptedPassword);
  } catch(err) {
    console.log('오류가 발생하였습니다.');
    res.status(500).json( {message : '오류가 발생하였습니다.'  });
  }
})
/* GET home page. */
router.get('/', function(req, res, next) {
  Task.find()
    .then((tasks) => {
      const currentTasks = tasks.filter(task => !task.completed);
      const completedTasks = tasks.filter(task => task.completed === true);

      console.log(`Total tasks: ${tasks.length}  CORS Current tasks: ${currentTasks.length}    Completed tasks:  ${completedTasks.length}`)
      res.render('index', { currentTasks: currentTasks, completedTasks: completedTasks });
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


router.post('/addTask', function(req, res, next) {
  const taskName = req.body.taskName;
  const createDate = Date.now();

  var task = new Task({
    taskName: taskName,
    createDate: createDate
  });
  console.log(`Adding a new task ${taskName} - createDate ${createDate}`)

  task.save()
      .then(() => {
        console.log(`Added new task ${taskName} - createDate ${createDate}`)
        res.redirect('/'); })
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
});

router.post('/completeTask', function(req, res, next) {
  console.log("I am in the PUT method")
  const taskId = req.body._id;
  const completedDate = Date.now();

  Task.findByIdAndUpdate(taskId, { completed: true, completedDate: Date.now()})
    .then(() => {
      console.log(`Completed task ${taskId}`)
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


router.post('/deleteTask', function(req, res, next) {
  const taskId = req.body._id;
  const completedDate = Date.now();
  Task.findByIdAndDelete(taskId)
    .then(() => {
      console.log(`Deleted task $(taskId)`)
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


module.exports = router;
