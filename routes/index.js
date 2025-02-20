var express = require('express');
var Task = require('../models/task');
const Chat = require('../models/chat');

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
    const { username, password, checkSession } = req.body;
    console.log(`Adding a new task ${username} - createDate ${password}`);
  } catch(err) {
    console.log('오류가 발생하였습니다.');
    res.status(500).json( {message : '오류가 발생하였습니다.'  });
  }
  // try {
  //   console.log(object);
  //   const decryptedUsername = decryption(username);
  //   const decryptedPassword = decryption(password);

  //   console.log(decryptedUsername, decryptedPassword);
  // } catch(err) {
  //   console.log('오류가 발생하였습니다.');
  //   res.status(500).json( {message : '오류가 발생하였습니다.'  });
  // }
})
/* GET home page. */
router.get('/', function(req, res, next) {
  // 이미 로그인된 사용자라면 채팅봇 페이지로 리다이렉트
  if (req.session && req.session.user) {
    res.redirect('/chatbot');
    return;
  }
  // 로그인되지 않은 사용자는 로그인 페이지로
  res.render('login');
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

// 로그인 페이지 렌더링
router.get('/login', function(req, res) {
  if (req.session && req.session.user) {
    res.redirect('/chatbot');
    return;
  }
  res.render('login');
});

// 로그인 처리
router.post('/login', async function(req, res) {
  const { username, password } = req.body;

  try {
    // 여기에 실제 인증 로직 구현
    if (username === "test" && password === "test") {
      // 세션에 사용자 정보 저장
      req.session.user = { username };
      res.redirect('/chatbot');
    } else {
      res.render('login', { error: '잘못된 사용자명 또는 비밀번호입니다.' });
    }
  } catch(err) {
    console.error(err);
    res.render('login', { error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// 채팅봇 페이지 (인증 필요)
router.get('/chatbot', checkAuth, function(req, res) {
  res.render('chatbot', { username: req.session.user.username });
});

// 인증 확인 미들웨어
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// 채팅 메시지 저장 및 응답
router.post('/api/chat', checkAuth, async function(req, res) {
  try {
    const { message } = req.body;
    const username = req.session.user.username;

    // 사용자 메시지 저장
    await Chat.create({
      username,
      message,
      type: 'user'
    });

    // 봇 응답 생성 (여기서는 간단한 예시)
    const botReply = `받은 메시지: ${message}`;

    // 봇 응답 저장
    await Chat.create({
      username,
      message: botReply,
      type: 'bot'
    });

    res.json({ reply: botReply });
  } catch(err) {
    console.error('채팅 처리 중 오류:', err);
    res.status(500).json({ error: '메시지 처리 중 오류가 발생했습니다.' });
  }
});

// 채팅 기록 조회
router.get('/api/chat/history', checkAuth, async function(req, res) {
  try {
    const username = req.session.user.username;
    const history = await Chat.find({ username })
      .sort({ timestamp: 1 })
      .limit(100);  // 최근 100개 메시지로 제한
    res.json(history);
  } catch(err) {
    console.error('채팅 기록 조회 중 오류:', err);
    res.status(500).json({ error: '채팅 기록 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
