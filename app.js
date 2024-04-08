const express = require('express');
const session = require('express-session');
const app = express();
const port = 3001;
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

function generateQuiz() {
  const countries = readCountries();
  const randomCountryIndex = Math.floor(Math.random() * countries.length);
  const correctCountry = countries[randomCountryIndex];
  const question = `문제 1. ${correctCountry.country}의 수도는?`;
  const correctAnswer = correctCountry.capital;

  // 다른 나라들 중에서 임의의 다섯 개를 선택하여 오답으로 사용
  const otherCountries = countries.filter((country, index) => index !== randomCountryIndex);
  const wrongOptions = [];
  while (wrongOptions.length < 5) {
    const randomIndex = Math.floor(Math.random() * otherCountries.length);
    wrongOptions.push(otherCountries[randomIndex].capital);
    otherCountries.splice(randomIndex, 1);
  }

  // 정답과 오답을 포함한 모든 보기 생성
  const options = [
    { optionNum: 1, optionText: correctAnswer, optionValue: correctAnswer }
  ];
  wrongOptions.forEach((option, index) => {
    options.push({ optionNum: index + 2, optionText: option, optionValue: option });
  });

  // 보기를 랜덤한 순서로 섞기
  options.sort(() => Math.random() - 0.5);

  // 퀴즈 객체에 정답 추가
  return { question, options, correctAnswer };
}


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // 폼 데이터를 파싱하기 위한 미들웨어 추가

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/quiz', (req, res) => {
  const quiz = generateQuiz();
  res.render('quiz', { question: quiz.question, options: quiz.options, correctAnswer: quiz.correctAnswer }); // correctAnswer를 템플릿으로 전달
});

app.post('/submit-quiz', (req, res) => {
  const answer = req.body.answer;
  const correctAnswer = req.body.correctAnswer;
  if (answer === correctAnswer) {
    res.sendFile(path.join(__dirname, 'public', 'correct.html')); // 정답일 때 정답 페이지 보여주기
  } else {
    res.sendFile(path.join(__dirname, 'public', 'incorrect.html')); // 오답일 때 오답 페이지 보여주기
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
