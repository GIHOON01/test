const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path'); // path 모듈 추가

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
function generateQuiz() {
  const countries = readCountries();
  const randomCountryIndex = Math.floor(Math.random() * countries.length);
  const question = `문제 1. ${countries[randomCountryIndex].country}의 수도는?`;
  const correctAnswer = countries[randomCountryIndex].capital;
  
  // 보기 생성
  const options = [];
  const optionIndices = [];
  optionIndices.push(randomCountryIndex); // 정답 추가
  
  // 랜덤한 오답 추가
  while (optionIndices.length < 5) {
    const randomIndex = Math.floor(Math.random() * countries.length);
    if (!optionIndices.includes(randomIndex)) {
      optionIndices.push(randomIndex);
    }
  }
  
  // 보기를 랜덤한 순서로 배열
  optionIndices.sort(() => Math.random() - 0.5);
  
  optionIndices.forEach((index, optionNum) => {
    options.push({
      optionNum: optionNum + 1,
      optionText: countries[index].capital,
      optionValue: countries[index].capital
    });
  });

  const quiz = { question, options };
  console.log('Generated Quiz:', quiz); // 퀴즈 객체 로그로 출력
  return quiz;
}


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // 폼 데이터를 파싱하기 위한 미들웨어 추가

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/quiz', (req, res) => {
  const quiz = generateQuiz();
  res.render('quiz', quiz); // quiz.ejs를 렌더링
});

app.post('/submit-quiz', (req, res) => {
  const answer = req.body.answer;
  const correctAnswer = req.body.correctAnswer; // 정답을 요청에서 가져옴
  if (answer === correctAnswer) {
    res.sendFile(__dirname + '/public/correct.html');
  } else {
    res.sendFile(__dirname + '/public/incorrect.html');
  }
});


app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
여기서 
// 읽어온 데이터베이스를 사용하여 퀴즈를 생성하는 예시 함수
function generateQuiz() {
  const countries = readCountries();
  const randomCountryIndex = Math.floor(Math.random() * countries.length);
  const question = `문제 1. ${countries[randomCountryIndex].country}의 수도는?`;
  const correctAnswer = countries[randomCountryIndex].capital;
  
  // 보기 생성
  const options = [];
  const optionIndices = [];
  let correctOptionNum = 0; // 정답의 위치를 저장할 변수
  
  // 랜덤한 오답 추가
  while (optionIndices.length < 5) {
    const randomIndex = Math.floor(Math.random() * countries.length);
    if (!optionIndices.includes(randomIndex)) {
      optionIndices.push(randomIndex);
    }
  }
  
  // 보기를 랜덤한 순서로 배열
  optionIndices.sort(() => Math.random() - 0.5);
  
  optionIndices.forEach((index, optionNum) => {
    const option = {
      optionNum: optionNum + 1,
      optionText: countries[index].capital,
      optionValue: countries[index].capital
    };
    options.push(option);
    if (option.optionText === correctAnswer) {
      correctOptionNum = optionNum + 1; // 정답의 위치 저장
    }
  });

  const quiz = { question, options, correctOptionNum }; // 정답의 위치를 quiz 객체에 추가
  console.log('Generated Quiz:', quiz); // 퀴즈 객체 로그로 출력
  return quiz;
}