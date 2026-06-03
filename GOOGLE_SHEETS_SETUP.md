# Google Sheets 이벤트 수집 설정 가이드

## 1. Google 스프레드시트 생성

1. [sheets.google.com](https://sheets.google.com) 에서 새 시트 생성
2. 시트 이름 자유롭게 설정 (예: "다이어트어디가 이벤트")

---

## 2. Apps Script 작성

1. 스프레드시트 상단 메뉴 → **확장 프로그램 → Apps Script**
2. 기존 코드 전부 삭제 후 아래 코드 붙여넣기:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // 시트가 비어있으면 헤더 자동 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Event Name',
        'Created At',
        'Result Type',
        'Top Recommendation',
        'Selected Answers',
        'Accuracy',
        'Interest',
        'Consultation Intent',
        'Name',
        'Phone',
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    }

    sheet.appendRow([
      data.eventName            || '',
      data.createdAt            || '',
      data.resultType           || '',
      data.topRecommendation    || '',
      data.selectedAnswers
        ? JSON.stringify(data.selectedAnswers)
        : '',
      data.accuracy             || '',
      data.interest             || '',
      data.consultationIntent   || '',
      data.name                 || '',
      data.phone                || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 저장 (Ctrl+S)

---

## 3. 웹 앱으로 배포

1. 우측 상단 **"배포"** → **"새 배포"**
2. 유형 선택 → **"웹 앱"**
3. 설정:
   - 설명: `다이어트어디가 이벤트 수집`
   - 다음 사용자로 실행: **나 (본인)**
   - 액세스 권한: **모든 사용자**
4. **"배포"** 클릭
5. Google 계정 권한 허용
6. **"웹 앱 URL"** 복사

> 예시: `https://script.google.com/macros/s/AKfycby.../exec`

---

## 4. Vercel 환경변수 등록

[vercel.com/dashboard](https://vercel.com/dashboard) → 프로젝트 → **Settings → Environment Variables**

| 변수명 | 값 |
|--------|----|
| `GOOGLE_SHEETS_WEBHOOK_URL` | 위에서 복사한 웹 앱 URL |

저장 후 **Deployments → 최신 배포 → Redeploy** 클릭

---

## 5. 수집되는 컬럼

| 컬럼 | 내용 |
|------|------|
| Event Name | 이벤트 종류 (quiz_start 등) |
| Created At | 발생 시각 (ISO 8601) |
| Result Type | 추천 유형 한글명 |
| Top Recommendation | 추천 유형 키값 |
| Selected Answers | 퀴즈 답변 JSON |
| Accuracy | 결과 정확도 피드백 |
| Interest | 관심 있는 방법 |
| Consultation Intent | 상담 의향 |
| Name | 이름 (선택) |
| Phone | 연락처 (선택) |

## 6. 수집되는 이벤트

| 이벤트 | 발생 시점 |
|--------|----------|
| `quiz_start` | 퀴즈 페이지 진입 |
| `quiz_complete` | 7번째 질문 제출 |
| `result_reached` | 결과 페이지 도달 |
| `business_view_click` | 업체 보기 버튼 클릭 |
| `businesses_page_visit` | 업체 목록 진입 |
| `feedback_submit` | 피드백 제출 |
