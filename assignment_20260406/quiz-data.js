// quiz-data.js — 카테고리별 10문제 × 4 = 40문제
// 스키마: { id, category, question, choices[4], answer(0-based), explanation, difficulty }

const QUESTIONS = [

  /* ───────────── 한국사 (KH-001 ~ KH-010) ───────────── */
  {
    id: "KH-001", category: "한국사", difficulty: "easy",
    question: "고려를 건국한 왕은 누구인가?",
    choices: ["궁예", "왕건", "견훤", "장보고"],
    answer: 1,
    explanation: "왕건(태조)이 918년 고려를 건국했습니다."
  },
  {
    id: "KH-002", category: "한국사", difficulty: "easy",
    question: "조선을 건국한 인물은?",
    choices: ["이성계", "정도전", "이방원", "최영"],
    answer: 0,
    explanation: "이성계(태조)가 1392년 조선을 건국했습니다."
  },
  {
    id: "KH-003", category: "한국사", difficulty: "medium",
    question: "현존하는 세계 최초의 금속활자 인쇄본은?",
    choices: ["팔만대장경", "직지심체요절", "훈민정음", "동의보감"],
    answer: 1,
    explanation: "직지심체요절(1377년)은 현존하는 세계 최초의 금속활자 인쇄본으로, 유네스코 세계기록유산에 등재되어 있습니다."
  },
  {
    id: "KH-004", category: "한국사", difficulty: "medium",
    question: "임진왜란이 시작된 연도는?",
    choices: ["1488년", "1592년", "1636년", "1776년"],
    answer: 1,
    explanation: "임진왜란은 1592년(선조 25년) 일본의 침략으로 시작되었습니다."
  },
  {
    id: "KH-005", category: "한국사", difficulty: "easy",
    question: "훈민정음을 창제한 조선의 왕은?",
    choices: ["태종", "성종", "세종", "연산군"],
    answer: 2,
    explanation: "세종대왕이 1443년 훈민정음을 창제하고 1446년 반포했습니다."
  },
  {
    id: "KH-006", category: "한국사", difficulty: "hard",
    question: "병인양요(1866)를 일으킨 나라는?",
    choices: ["미국", "영국", "프랑스", "일본"],
    answer: 2,
    explanation: "프랑스는 병인박해(천주교 탄압)에 항의하며 강화도를 침략했습니다."
  },
  {
    id: "KH-007", category: "한국사", difficulty: "medium",
    question: "3·1 운동이 일어난 연도는?",
    choices: ["1905년", "1910년", "1919년", "1945년"],
    answer: 2,
    explanation: "3·1 운동은 1919년 3월 1일 전국적으로 일어난 독립운동입니다."
  },
  {
    id: "KH-008", category: "한국사", difficulty: "easy",
    question: "대한민국 정부가 수립된 연도는?",
    choices: ["1919년", "1945년", "1948년", "1950년"],
    answer: 2,
    explanation: "대한민국 정부는 1948년 8월 15일에 수립되었습니다."
  },
  {
    id: "KH-009", category: "한국사", difficulty: "hard",
    question: "을사늑약(1905)이 체결된 결과로 일본에 넘어간 것은?",
    choices: ["사법권", "외교권", "군사권", "경찰권"],
    answer: 1,
    explanation: "을사늑약으로 대한제국의 외교권이 일본에 박탈되었습니다."
  },
  {
    id: "KH-010", category: "한국사", difficulty: "medium",
    question: "6·25 전쟁(한국전쟁)의 정전협정이 체결된 연도는?",
    choices: ["1950년", "1951년", "1953년", "1960년"],
    answer: 2,
    explanation: "정전협정은 1953년 7월 27일 판문점에서 체결되었습니다."
  },
  {
    id: "KH-011", category: "한국사", difficulty: "medium",
    question: "갑신정변(1884년)을 주도한 인물은?",
    choices: ["김옥균", "흥선대원군", "전봉준", "이토 히로부미"],
    answer: 0,
    explanation: "갑신정변은 1884년 12월 김옥균을 중심으로 한 급진개화파가 조선의 근대화를 목표로 일으킨 정변으로, 3일 만에 실패로 끝났습니다."
  },

  /* ───────────── 과학 (SC-001 ~ SC-010) ───────────── */
  {
    id: "SC-001", category: "과학", difficulty: "easy",
    question: "물(H₂O)을 구성하는 원소가 아닌 것은?",
    choices: ["수소", "산소", "탄소", "해당 없음"],
    answer: 2,
    explanation: "물은 수소(H) 2개와 산소(O) 1개로만 구성됩니다. 탄소는 포함되지 않습니다."
  },
  {
    id: "SC-002", category: "과학", difficulty: "easy",
    question: "태양계에서 태양과 세 번째로 가까운 행성은?",
    choices: ["금성", "화성", "지구", "수성"],
    answer: 2,
    explanation: "태양에서 가까운 순서는 수성 → 금성 → 지구입니다."
  },
  {
    id: "SC-003", category: "과학", difficulty: "medium",
    question: "빛의 속도(진공 중)에 가장 가까운 값은?",
    choices: ["약 30만 km/s", "약 3만 km/s", "약 300 km/s", "약 30억 km/s"],
    answer: 0,
    explanation: "빛의 속도는 진공 중에서 약 299,792 km/s ≈ 30만 km/s입니다."
  },
  {
    id: "SC-004", category: "과학", difficulty: "easy",
    question: "사람의 혈액형을 결정하는 ABO식 분류에서 존재하지 않는 혈액형은?",
    choices: ["A형", "B형", "C형", "O형"],
    answer: 2,
    explanation: "ABO식 혈액형은 A, B, AB, O형 네 가지이며 C형은 없습니다."
  },
  {
    id: "SC-005", category: "과학", difficulty: "medium",
    question: "DNA의 이중나선 구조를 처음 규명한 과학자 쌍은?",
    choices: ["뉴턴·라이프니츠", "왓슨·크릭", "퀴리·아인슈타인", "다윈·멘델"],
    answer: 1,
    explanation: "제임스 왓슨과 프랜시스 크릭이 1953년 네이처지에 DNA 이중나선 구조를 처음 발표했습니다. (로잘린드 프랭클린의 X선 회절 데이터가 핵심 근거로 활용되었습니다.)"
  },
  {
    id: "SC-006", category: "과학", difficulty: "hard",
    question: "원소 주기율표에서 원자번호 1번 원소는?",
    choices: ["헬륨(He)", "탄소(C)", "수소(H)", "리튬(Li)"],
    answer: 2,
    explanation: "원자번호 1번은 수소(H)로, 양성자 1개를 갖는 가장 가벼운 원소입니다."
  },
  {
    id: "SC-007", category: "과학", difficulty: "medium",
    question: "뉴턴의 운동 제2법칙(F=ma)에서 'a'가 나타내는 것은?",
    choices: ["질량", "속도", "가속도", "힘"],
    answer: 2,
    explanation: "F=ma에서 F는 힘, m은 질량, a는 가속도를 나타냅니다."
  },
  {
    id: "SC-008", category: "과학", difficulty: "hard",
    question: "광합성 과정에서 식물이 흡수하는 기체는?",
    choices: ["산소(O₂)", "질소(N₂)", "이산화탄소(CO₂)", "수소(H₂)"],
    answer: 2,
    explanation: "식물은 광합성 시 이산화탄소(CO₂)를 흡수하고 산소(O₂)를 방출합니다."
  },
  {
    id: "SC-009", category: "과학", difficulty: "easy",
    question: "지구 대기의 약 78%를 차지하는 기체는?",
    choices: ["산소", "질소", "아르곤", "이산화탄소"],
    answer: 1,
    explanation: "지구 대기는 질소 약 78%, 산소 약 21%로 구성되어 있습니다."
  },
  {
    id: "SC-010", category: "과학", difficulty: "medium",
    question: "절대온도 0K(켈빈)는 섭씨온도로 약 몇 °C인가?",
    choices: ["-100°C", "-200°C", "-273°C", "-373°C"],
    answer: 2,
    explanation: "절대영도 0K는 약 -273.15°C로, 이론적으로 도달할 수 없는 최저 온도입니다."
  },

  /* ───────────── 지리 (GE-001 ~ GE-010) ───────────── */
  {
    id: "GE-001", category: "지리", difficulty: "easy",
    question: "세계에서 인구가 가장 많은 나라는? (2024년 기준)",
    choices: ["중국", "인도", "미국", "인도네시아"],
    answer: 1,
    explanation: "2024년 기준 인도의 인구가 약 14억 4천만 명으로 세계 1위입니다."
  },
  {
    id: "GE-002", category: "지리", difficulty: "easy",
    question: "한반도에서 면적 기준으로 가장 큰 섬은?",
    choices: ["거제도", "진도", "강화도", "제주도"],
    answer: 3,
    explanation: "제주도는 면적 약 1,849km²로 한반도에서 면적 기준 가장 큰 섬입니다."
  },
  {
    id: "GE-003", category: "지리", difficulty: "medium",
    question: "아프리카 대륙에서 면적 기준으로 가장 큰 나라는?",
    choices: ["수단", "콩고민주공화국", "알제리", "리비아"],
    answer: 2,
    explanation: "알제리는 약 238만 km²로 아프리카 대륙에서 면적 기준 가장 큰 나라입니다."
  },
  {
    id: "GE-004", category: "지리", difficulty: "easy",
    question: "유럽에서 면적 기준으로 가장 큰 나라는?",
    choices: ["프랑스", "독일", "러시아", "우크라이나"],
    answer: 2,
    explanation: "러시아는 유럽과 아시아에 걸쳐 있으며, 유럽 부분만으로도 면적 기준 가장 큽니다."
  },
  {
    id: "GE-005", category: "지리", difficulty: "medium",
    question: "세계에서 길이 기준으로 가장 긴 강은?",
    choices: ["아마존강", "미시시피강", "나일강", "양쯔강"],
    answer: 2,
    explanation: "나일강은 길이 약 6,650km로 일반적으로 세계에서 길이 기준 가장 긴 강으로 인정됩니다."
  },
  {
    id: "GE-006", category: "지리", difficulty: "medium",
    question: "대한민국의 수도는?",
    choices: ["부산", "인천", "서울", "세종"],
    answer: 2,
    explanation: "대한민국의 수도는 서울특별시입니다."
  },
  {
    id: "GE-007", category: "지리", difficulty: "hard",
    question: "적도가 지나지 않는 대륙은?",
    choices: ["아프리카", "아시아", "남아메리카", "오세아니아(호주)"],
    answer: 3,
    explanation: "적도는 아프리카, 아시아, 남아메리카를 지나지만, 오스트레일리아 본토는 지나지 않습니다."
  },
  {
    id: "GE-008", category: "지리", difficulty: "easy",
    question: "일본의 수도는?",
    choices: ["오사카", "도쿄", "교토", "나고야"],
    answer: 1,
    explanation: "일본의 수도는 도쿄(東京)입니다."
  },
  {
    id: "GE-009", category: "지리", difficulty: "medium",
    question: "세계에서 육지 면적 기준으로 가장 큰 대륙은?",
    choices: ["아메리카", "아프리카", "아시아", "유럽"],
    answer: 2,
    explanation: "아시아는 약 4,440만 km²로 육지 면적 기준 세계에서 가장 큰 대륙입니다."
  },
  {
    id: "GE-010", category: "지리", difficulty: "hard",
    question: "한국의 표준시(KST)는 UTC 기준으로 몇 시간 앞서 있는가?",
    choices: ["+8시간", "+9시간", "+10시간", "+7시간"],
    answer: 1,
    explanation: "한국 표준시(KST)는 UTC+9입니다."
  },

  /* ───────────── 일반상식 (GK-001 ~ GK-010) ───────────── */
  {
    id: "GK-001", category: "일반상식", difficulty: "easy",
    question: "올림픽의 오륜기에서 오륜(5개의 원)이 상징하는 것은?",
    choices: ["5개의 종목", "5개의 대륙", "5개의 창시국", "5번의 올림픽"],
    answer: 1,
    explanation: "오륜기의 5개 원은 아프리카·아시아·아메리카·유럽·오세아니아 5개 대륙을 상징합니다."
  },
  {
    id: "GK-002", category: "일반상식", difficulty: "easy",
    question: "1년은 몇 초인가? (윤년 제외, 365일 기준)",
    choices: ["약 3,153만 초", "약 315만 초", "약 8,760 초", "약 86,400 초"],
    answer: 0,
    explanation: "365일 × 24시간 × 3,600초 = 31,536,000초(약 3,153만 초)입니다."
  },
  {
    id: "GK-003", category: "일반상식", difficulty: "medium",
    question: "유네스코(UNESCO)에서 'U'가 뜻하는 것은?",
    choices: ["United", "Universal", "Union", "Urban"],
    answer: 0,
    explanation: "UNESCO는 United Nations Educational, Scientific and Cultural Organization의 약자입니다."
  },
  {
    id: "GK-004", category: "일반상식", difficulty: "easy",
    question: "컴퓨터에서 1GB는 몇 MB인가?",
    choices: ["100MB", "512MB", "1,000MB", "1,024MB"],
    answer: 3,
    explanation: "이진법 기준 1GB = 1,024MB = 1,048,576KB입니다."
  },
  {
    id: "GK-005", category: "일반상식", difficulty: "medium",
    question: "노벨상이 처음 수여된 연도는?",
    choices: ["1895년", "1901년", "1910년", "1920년"],
    answer: 1,
    explanation: "노벨상은 알프레드 노벨의 유언에 따라 1901년부터 처음 수여되었습니다."
  },
  {
    id: "GK-006", category: "일반상식", difficulty: "easy",
    question: "인터넷 주소(URL)에서 'https'의 's'가 의미하는 것은?",
    choices: ["Speed", "Secure", "Server", "Standard"],
    answer: 1,
    explanation: "HTTPS = HyperText Transfer Protocol Secure로, 's'는 보안(Secure) 연결을 뜻합니다."
  },
  {
    id: "GK-007", category: "일반상식", difficulty: "medium",
    question: "피카소(Pablo Picasso)의 출신 국가는?",
    choices: ["프랑스", "이탈리아", "스페인", "포르투갈"],
    answer: 2,
    explanation: "파블로 피카소는 1881년 스페인 말라가에서 태어났습니다."
  },
  {
    id: "GK-008", category: "일반상식", difficulty: "hard",
    question: "혈액형이 모든 혈액형에게 수혈할 수 있는 혈액형은? (ABO식, 동일 Rh 가정)",
    choices: ["A형", "B형", "AB형", "O형"],
    answer: 3,
    explanation: "O형은 ABO식 기준 적혈구에 A·B 항원이 없어 모든 혈액형에 수혈 가능한 만능공혈자입니다."
  },
  {
    id: "GK-009", category: "일반상식", difficulty: "medium",
    question: "국제연합(UN)의 공식 언어 수는?",
    choices: ["4개", "5개", "6개", "7개"],
    answer: 2,
    explanation: "UN 공식 언어는 영어·프랑스어·스페인어·러시아어·중국어·아랍어 6개입니다."
  },
  {
    id: "GK-010", category: "일반상식", difficulty: "easy",
    question: "태극기의 4괘 중 '건(乾)'이 나타내는 방향은?",
    choices: ["왼쪽 위", "왼쪽 아래", "오른쪽 위", "오른쪽 아래"],
    answer: 0,
    explanation: "태극기에서 건(하늘)은 왼쪽 위, 곤(땅)은 오른쪽 아래, 감(물)은 오른쪽 위, 이(불)는 왼쪽 아래에 위치합니다."
  },
  {
    id: "GK-011", category: "일반상식", difficulty: "hard",
    question: "빛이 지구에서 달까지 도달하는 데 걸리는 시간은 약 몇 초인가?",
    choices: ["약 0.13초", "약 1.28초", "약 8.32초", "약 12.5초"],
    answer: 1,
    explanation: "지구~달 평균 거리 약 384,400km를 빛의 속도(약 299,792km/s)로 나누면 약 1.28초입니다. 약 8.32분은 지구~태양 간 빛의 이동 시간으로, 달과 혼동하지 않도록 주의가 필요합니다."
  }

]; // end QUESTIONS
