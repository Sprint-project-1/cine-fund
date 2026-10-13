# API 명세 초안

> 이 문서는 **React ↔ CineFund 백엔드** 간 내부 API 초안이다. TMDB API를 앱 실행 중 호출하는 계약은 필요하지 않으며 이 문서에 포함하지 않는다. TMDB는 초기 seed/import 작업에서 100편의 메타데이터를 가져와 PostgreSQL에 적재하는 데 사용한다. 아래 경로는 모두 제안이며 팀/API 담당자 확정 전 계약이 아니다. 가입/로그인 API는 없다. 펀딩은 비로그인·무결제 모의 기능이며 참여 입력/수정 UI와 서버 API의 세부 계약은 별도 합의가 필요하다.

> 저장소 현황: `main`에 React Router 화면 scaffold는 있으나 백엔드 서버/API 구현은 확인되지 않았다. 따라서 이 문서는 FE와 BE가 향후 연동할 내부 API 제안이며 현재 서비스 endpoint를 뜻하지 않는다. 현재 프런트 경로는 `/`, `/detail`, `/compare`, `/compare-result`, `/ranking`; 기획 경로와 차이는 [PAGE_SPEC](PAGE_SPEC.md)에서 추적한다.

## 공통 규칙

- 성공 응답은 JSON. 오류는 `{ "error": { "code": "VALIDATION_ERROR", "message": "입력값을 확인해 주세요.", "details": [] } }` 형식 제안.
- 페이지 응답: `{ "items": [], "page": { "nextCursor": "opaque-token-or-null", "hasMore": true } }`.
- 목록 기본 `limit=20`, 최대 50 제안. 코멘트는 항상 10개씩.
- cursor는 안정적인 정렬을 포함한 불투명 토큰을 제안한다. 랜덤 기본 순서 유지 방식 TBD.
- 공통 영화 필드 제안: `movieId`, `tmdbId`, `title`, `releaseDate`, `genres`, `tagline`, `productionBudget`, `fundingGoal`, `totalFundedAmount`, `achievementRate`. Figma 후보 필드 `posterPath`, `overview`, `director`의 출처·저장·응답 여부는 API 담당자와 확정한다.
- 공통 펀딩 필드: `fundingId`, `movieId`, `nickname`, `amount`, `comment`, `createdAt`. 비밀번호/해시는 응답 금지.

## 엔드포인트 제안

| Method / Path | 목적 |
|---|---|
| GET `/api/movies` | 목록 및 정렬/페이지네이션 |
| GET `/api/movies/{movieId}` | 상세 및 펀딩 현황 |
| POST `/api/comparisons` | 2~5개 영화 비교 데이터 조회(상태 저장 없이 요청 본문 전달) |
| POST `/api/movies/{movieId}/fundings` | 제안: 비로그인 모의 펀딩 참여 입력 제출 (요구/API 합의 필요) |
| GET `/api/movies/{movieId}/comments` | 제안: 최신 코멘트 10개씩 조회 (페이지 방식 합의 필요) |
| PATCH `/api/fundings/{fundingId}/comment` | 제안: 비밀번호 검증 후 코멘트 수정 (권한/API 합의 필요) |

### 목록 / 정렬

`GET /api/movies?limit=20&cursor=...&sortBy=amount&order=desc`

`sortBy`: `amount` 또는 `achievementRate`; `order`: `asc` 또는 `desc`. 둘 중 하나가 없을 때 기본 랜덤. 제안: 기본 랜덤과 정렬은 동시에 적용하지 않는다. tie-breaker는 `movieId`. 목표액이 없거나 0인 달성률 정렬 위치는 TBD.

```json
{
  "items": [{
    "movieId": 101, "tmdbId": 550, "title": "Example",
    "posterPath": null, "overview": null, "director": null,
    "releaseDate": "2020-01-01", "genres": ["Drama"],
    "tagline": null, "productionBudget": 1000000,
    "fundingGoal": null, "totalFundedAmount": 25000,
    "achievementRate": null
  }],
  "page": { "nextCursor": "opaque", "hasMore": true }
}
```

### 상세 조회

`GET /api/movies/101` 응답 제안: `{ "movie": { ...영화 필드 }, "comments": { "items": [], "page": { "nextCursor": null, "hasMore": false } } }`. 실제 초기 코멘트는 상세와 별도 조회해도 된다(TBD).

### 비교

`POST /api/comparisons` body: `{ "movieIds": [101, 102] }`. 성공: `{ "items": [ { ...영화 필드 } ] }`. 2~5개, 중복 금지. 선택 보존을 위해 URL query 전달은 FE 제안이며 데이터가 너무 길면 요청 API 방식을 택한다.

### 모의 펀딩 참여 등록 (제안 요청/응답)

`POST /api/movies/101/fundings`

```json
{ "amount": 10000, "nickname": "영화팬", "comment": "기대돼요", "password": "user-entered-secret" }
```

응답 `201`: `{ "funding": { "fundingId": 9001, "movieId": 101, "nickname": "영화팬", "amount": 10000, "comment": "기대돼요", "createdAt": "2026-10-11T12:00:00Z" }, "totalFundedAmount": 35000 }`. 금액 상·하한, 통화는 TBD. 닉네임 ≤8, 코멘트 ≤100, 비밀번호 최소 기준은 보안 합의 필요.

### 코멘트 조회 및 수정 (제안 요청/응답)

`GET /api/movies/101/comments?limit=10&cursor=...` — `limit`은 제안상 10 고정. 응답은 공통 페이지 형식.

`PATCH /api/fundings/9001/comment` body: `{ "password": "user-entered-secret", "comment": "수정한 내용" }`. 성공: `{ "funding": { "fundingId": 9001, "comment": "수정한 내용", "updatedAt": "..." } }`.

## 상태 코드 및 검증

| 코드 | 사용 |
|---|---|
| 200 | 조회/수정 성공 |
| 201 | 펀딩 등록 성공 |
| 400 | 잘못된 형식/범위/비교 개수 |
| 401 또는 403 | 비밀번호 불일치 (팀 결정; 정보 노출 최소화) |
| 404 | 영화/펀딩 없음 |
| 409 | 충돌/무결성 충돌 |
| 429 | 요청 제한 |
| 500/503 | CineFund 서버/DB 오류 |

서버가 모든 입력을 재검증한다. ID 정수/존재, cursor 형식, sort enum, 고유 movieIds, 닉네임 8자, 코멘트 100자, 양의 정수 amount 및 비밀번호 형식을 확인한다. 오류 메시지에 해시/SQL/stack을 포함하지 않는다.

## TMDB 초기 데이터 적재와 내부 API 경계

- TMDB 요청은 준비 단계의 seed/import 작업이 수행한다. 사용자 브라우저나 각 영화 화면 요청이 TMDB에 직접 접근하지 않는다.
- 내부 서버 API는 DB에 저장된 영화 목록/상세/펀딩/비교 데이터를 React에 전달하므로 계속 필요하다. DB 접속정보를 브라우저에 노출하지 않는다.
- 영화 ID 100개 목록, 요청할 TMDB 필드, 상세 조회/이미지 path 저장 방식, 재실행 시 upsert 정책, 일부 요청 실패 처리, 갱신 시점은 TBD다.
- ID 목록은 공유할 수 있도록 JSON 파일(예: `prisma/seed-movie-ids.json`)로 관리하는 방안을 제안한다. 이 파일/seed import는 TMDB 데이터 준비용이며 React가 호출하는 HTTP endpoint가 아니다.
- TMDB 키 오류·호출 제한·네트워크 장애는 앱의 매 요청에서 발생하는 런타임 오류가 아니라 seed/import 실행 오류로 기록하고, 재실행할 수 있도록 설계한다.

## Figma 추가 항목 및 API 담당자 확인

- 로그인/회원가입은 Figma 및 현재 서비스 범위에 없다. 익명 펀딩 입력은 계정 등록과 다른 UI이며, 이 문서의 POST는 API 담당자와 정리할 제안이다.
- 상세의 펀딩 취소 팝업이 실제 제출 취소 확인인지 단순 모달 닫기인지 시안 상호작용을 확인해야 한다. 펀딩 기록 취소/삭제 API는 현재 제안에 포함하지 않는다.

- 홈 헤더/비교 선택 화면의 영화 검색은 UI만 확인됐다. 검색 endpoint, query parameter, 검색 대상 100편 범위는 TBD이며 현재 계약에 포함하지 않는다.
- 비교 결과 시안의 `overview`(설명), `director`(감독) 및 포스터 필드는 API/DB 후보이다. 데이터 출처와 TMDB 응답 매핑을 확인한 뒤 필드 계약을 갱신한다.
- AI 비교 요약은 기존 기획 외 시안 요소로, endpoint/provider를 정하지 않았다.
- 상세 시안은 코멘트 페이지 번호를 표시하지만 초안은 cursor다. 백엔드 page/offset 또는 FE page-to-cursor 매핑 중 하나를 선택해 계약을 통일해야 한다.
- 펀딩/코멘트는 로그인·실결제 없는 모의 기능이다. 요청·응답/상태 코드의 구체 계약은 API 담당자 작성본과 팀 합의 후 확정한다.
