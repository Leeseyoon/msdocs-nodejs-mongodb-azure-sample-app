var express = require('express');
var Task = require('../models/task');
const Chat = require('../models/chat');
const User = require('../models/user');

var router = express.Router();
const app = express();
const cors = require('cors');
const CryptoJS = require('crypto-js');

const allowedOrigins = [
  'https://js-deploy-test-h4fafsheajbvczgx.koreacentral-01.azurewebsites.net',
  'http://localhost:3000'
];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
        res.status(200).json({ message: '로그인 성공.' });
        // 사용자 조회 및 인증 로직
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: '로그인 실패.' });
        }

        // 로그인 성공 시 세션 설정
        req.session.user = {
            id: user._id,
            username: user.username
        };

        res.status(200).json({ message: '로그인 성공.' });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    // if (req.session && req.session.user) {
    //   return res.redirect('/chatbot');
    // }
    // res.send('<h1>Welcome to the Home Page!!</h1>');
    res.render('index');
  } catch(err) {
    next(err);
  }
});


router.post('/addTask', async function(req, res, next) {
  try {
    const taskName = req.body.taskName;
    const createDate = Date.now();

    const task = new Task({
      taskName: taskName,
      createDate: createDate
    });

    await task.save();
    console.log(`Added new task ${taskName} - createDate ${createDate}`);
    res.redirect('/');
  } catch(err) {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  }
});

router.post('/completeTask', async function(req, res, next) {
  try {
    const taskId = req.body._id;
    await Task.findByIdAndUpdate(taskId, {
      completed: true,
      completedDate: Date.now()
    });
    console.log(`Completed task ${taskId}`);
    res.redirect('/');
  } catch(err) {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  }
});


router.post('/deleteTask', async function(req, res, next) {
  try {
    const taskId = req.body._id;
    await Task.findByIdAndDelete(taskId);
    console.log(`Deleted task ${taskId}`);
    res.redirect('/');
  } catch(err) {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  }
});

// 로그인 페이지 렌더링
router.get('/login', function(req, res) {
  if (req.session && req.session.user) {
    res.redirect('/chatbot');
    return;
  }
  res.render('login');
});

// 회원가입 처리
router.post('/register', async function(req, res) {
  try {
    const { username, password } = req.body;

    // 이미 존재하는 사용자 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('login', { error: '이미 존재하는 사용자명입니다.' });
    }

    // 새 사용자 생성
    const user = new User({ username, password });
    await user.save();

    res.redirect('/login');
  } catch(err) {
    console.error(err);
    res.render('login', { error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인 처리 수정
router.post('/login', async function(req, res) {
  try {
    const { username, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: '잘못된 비밀번호입니다.' });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user._id,
      username: user.username
    };

    res.redirect('/chatbot');
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

// 로그아웃 처리
router.get('/logout', function(req, res) {
  // 세션 삭제
  req.session.destroy((err) => {
    if(err) {
      console.error('로그아웃 중 오류 발생:', err);
      return res.status(500).send('로그아웃 처리 중 오류가 발생했습니다.');
    }
    // 로그인 페이지로 리다이렉트
    res.redirect('/');
  });
});

// 데이터 추가 엔드포인트
router.post('/api/addData', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const creatDate = Date.now();

        // 새로운 사용자 생성
        const newUser = new User({
            username: username,
            password: password, // 비밀번호는 해싱 미들웨어에 의해 해싱됩니다.
            created_at: creatDate,
        });

        // 사용자 데이터를 데이터베이스에 저장
        await newUser.save();
        console.log(`Added new task ${username} ${password} - createDate ${creatDate}`);
        res.redirect('/');
        // 성공 응답
        res.status(201).json({ message: '사용자가 추가되었습니다.', user: newUser });
    } catch (error) {
        console.error('데이터 추가 중 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
