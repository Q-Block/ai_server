const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');  // 추가된 axios
const app = express();
const urlModule = require('url'); // URL 파싱을 위한 모듈

app.use(express.json());

// MySQL 데이터베이스 연결
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0309',
  database: 'qblock_db',
});

// 데이터베이스 연결 확인
db.connect((err) => {
  if (err) throw err;
  console.log('MySQL 연결 성공');
});

// 가정된 프론트엔드에서 넘어온 URL (이 값이 프론트엔드에서 넘어온다고 가정)
const frontendData = {
  url_id: '1111',
  url: 'https://naver.com',  // 하위 경로가 있는 URL
  qr_status: true
};

// 상위 도메인 추출 함수
const extractRootDomain = (url) => {
  const parsedUrl = urlModule.parse(url);
  const hostname = parsedUrl.hostname;

  // 'docs' 서브 도메인이 있는지 확인
  if (hostname.startsWith('docs.')) {
    throw new Error('docs 서브 도메인을 가진 URL은 허용되지 않습니다.');
  }

  // 서브 도메인을 제거하고 상위 도메인만 추출
  const parts = hostname.split('.');
  if (parts.length > 2) {
    // 예를 들어, map.naver.com -> naver.com
    return parts.slice(-2).join('.');
  }
  return hostname;
};

// 프론트엔드에서 URL이 들어오면 바로 DB 조회 및 처리
const checkAndProcessURL = (url, url_id, qr_status) => {
  let rootDomain;
  try {
    rootDomain = extractRootDomain(url); // 상위 도메인 추출
  } catch (error) {
    console.error('URL 처리 중 오류:', error.message);
    return;  // 예외 발생 시 함수 종료
  }

  // URL이 데이터베이스에 있는지 조회 (상위 도메인 기준으로 검색)
  const selectQuery = `
    SELECT malicious_status 
    FROM AI 
    WHERE url LIKE ?
  `;

  db.query(selectQuery, [`%${rootDomain}%`], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // 데이터베이스에서 악성 여부만 가져와서 요청한 데이터를 업데이트
      const maliciousStatus = result[0].malicious_status ? '악성' : '정상';
      console.log('URL 정보 조회 성공:', {
        url_id: url_id,  // 요청한 URL 정보 유지
        url: url,
        qr_status: qr_status,
        malicious_status: maliciousStatus,  // DB에서 가져온 malicious_status만 업데이트
      });
    } else {
      // 데이터베이스에 URL이 없음, Flask AI 서버로 요청 전송
      console.log('해당 URL이 데이터베이스에 없음. Flask AI 서버로 요청을 전송합니다.');

      // Flask AI 서버로 URL, url_id, qr_status 전송
      axios.post('http://BASE_URL/check-url', {
        url: url,
        url_id: url_id,
        qr_status: qr_status
      })
      .then(response => {
        const { url_id, url, qr_status, malicious_status } = response.data;
        console.log('AI 서버로부터 받은 응답:', {
          url_id,
          url,
          qr_status,
          malicious_status: malicious_status ? '악성' : '정상',
        });

        // '악성'일 경우 1, '정상'일 경우 0으로 변환하여 저장
        const maliciousStatusValue = (malicious_status === '악성') ? 1 : 0;

        // 여기서 받은 데이터를 다시 DB에 저장
        const insertQuery = `
          INSERT INTO AI (url_id, url, qr_status, malicious_status)
          VALUES (?, ?, ?, ?)
        `;

        db.query(insertQuery, [url_id, url, qr_status, maliciousStatusValue], (err, result) => {
          if (err) throw err;
          console.log('AI 서버 응답을 데이터베이스에 저장 완료');
        });
      })
      .catch(error => {
        console.error('AI 서버 요청 중 오류 발생:', error);
      });
    }
  });
};

// 프론트엔드에서 URL이 들어왔다고 가정하고 해당 함수 호출
checkAndProcessURL(frontendData.url, frontendData.url_id, frontendData.qr_status);

// 서버 실행
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중...');
});






