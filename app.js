const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path'); // path 모듈 추가

// 세션 설정
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// 뷰 엔진 설정
app.set('view engine', 'ejs');

// 뷰 디렉토리 설정
app.set('views', path.join(__dirname, 'views'));

// JSON 파일을 읽어오는 함수
function readCountries() {
  try {
    // 파일 경로 수정
    const data = fs.readFileSync(path.join(__dirname, 'data', 'countries.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading countries file:', err);
    return [];
  }
}

// 읽어온 데이터베이스를 사용하여 퀴즈를 생성하는 예시 함수
function generateQuiz(req) {
  const countries = readCountries();
  const randomCountryIndex = Math.floor(Math.random() * countries.length);
  const question = `문제 1. ${countries[randomCountryIndex].country}의 수도는?`;
  const correctAnswer = countries[randomCountryIndex].capital;
  const otherOptions = countries
    .filter((country, index) => index !== randomCountryIndex)
    .map(country => country.capital);
  const options = otherOptions.map((option, index) => {
    return {
      optionNum: index + 2, // 2번부터 시작 (1번은 정답)
      optionText: option,
      optionValue: option // 라디오 버튼의 값으로 사용
    };
  });
  options.unshift({ // 정답을 옵션 배열 맨 앞에 추가
    optionNum: 1,
    optionText: correctAnswer,
    optionValue: correctAnswer
  });

  // 퀴즈 객체에 정답 저장
  req.session.quiz = {
    question,
    options,
    correctAnswer
  };

  return req.session.quiz;
}

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // 폼 데이터를 파싱하기 위한 미들웨어 추가

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/quiz', (req, res) => {
  if (!req.session.quiz) {
    generateQuiz(req);
  }
  res.render('quiz', req.session.quiz); // 퀴즈 렌더링
});

app.post('/submit-quiz', (req, res) => {
  const answer = req.body.answer;
  const correctAnswer = req.session.quiz.correctAnswer;

  // 정답인 경우
  if (answer === correctAnswer) {
    res.sendFile(__dirname + '/public/correct.html');
  } else {
    res.sendFile(__dirname + '/public/incorrect.html');
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
