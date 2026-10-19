# CineFund API 명세

> **문서 상태: 계약 제안서, 2026-10-19 기준.** 현재 서버에 구현된 경로는 `GET /health`뿐이다. 아래 `/api` 경로와 요청·응답은 팀/API 담당자 확정 전 제안이다. 영화 탐색·상세·랭킹 및 비교 선택/결과 페이지 명세를 하나로 정리했다. 실제 결제는 범위에 없다.

## 1. 공통 원칙

- 브라우저는 백엔드 API를 호출하고, DB 접근은 서버가 담당한다.
- TMDB는 초기 영화 데이터 적재에 사용한다. 페이지 조회 시에는 DB에 적재된 지정 영화 100편을 조회하며, 매 요청마다 TMDB에 영화 정보를 다시 요청하지 않는다.
- 비교 대상 식별자는 외부 `tmdbId`가 아니라 CineFund DB의 `movieId`를 사용한다.
- seed는 TMDB `budget` 숫자를 `productionBudget`에 그대로 저장하며, 이 필드는 TMDB 원본 제작비(USD)다. 펀딩 목표액은 `productionBudget` 숫자를 환율 계산 없이 그대로 사용해 KRW로 표시한다. 예: `productionBudget = "225000000"`이면 화면의 목표액 표시는 `₩225,000,000`이다. 이는 환율 변환이 아니다. 영화 선정에 사용한 환율 기준은 저장값이나 목표액 표시에 적용하지 않는다.
- 백엔드 PR의 최신 `API_SPEC.md`와 schema에는 `fundingGoal` 필드가 없다. 따라서 API 응답에는 `productionBudget` 원본 숫자만 포함하고, 프런트엔드가 같은 숫자를 목표액(KRW) 표시값으로 사용한다. `achievementRate`도 API 필드가 아닌 화면 계산값으로 제안한다.
- 성공/오류 응답의 공통 형식과 API prefix/version은 팀 결정 전 제안이다. 오류 예시는 `{ "error": { "code": "VALIDATION_ERROR", "message": "입력값을 확인해 주세요." } }`이다.
- Prisma `BigInt` 금액은 JavaScript JSON 직렬화에서 문자열로 전달하는 안이다. 클라이언트는 금액을 부동소수점으로 변환하지 않는다.
- 랜덤 목록은 페이지를 추가 조회하는 동안 순서가 유지되어야 한다. cursor에 순서를 담는 방식은 백엔드 구현 전 확정한다.
- 목록 페이지 UI는 한 번에 최대 10편을 보여준다. 비교 선택 화면에서 더 많은 후보를 불러오는 API 요청 크기 상한은 TBD다.

## 2. 현재 구현 상태

| Method / Path | 상태 | 목적 |
|---|---|---|
| `GET /health` | 구현됨 | 서버 상태 확인 |
| `GET /api/movies` | 제안 | 영화 목록·제목 검색·펀딩액 정렬·페이지네이션 |
| `GET /api/movies/{movieId}` | 제안 | 영화 상세 조회 |
| `POST /api/comparisons` | 제안 | 선택한 2~5편의 비교 데이터 조회 |

펀딩 등록·코멘트 조회/수정 API는 화면 및 기능 합의가 끝나지 않아 아래 7절의 미확정 항목으로 둔다.

## 3. 영화 목록 및 비교 선택 후보 조회

`GET /api/movies`

영화 탐색 페이지와 비교 선택 화면에서 함께 사용한다. 목록 응답의 `movieId`를 상세 조회와 비교 결과 요청에 전달한다.

### Query parameters

| 이름 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `limit` | number | 아니요 | 응답할 영화 수. 백엔드 PR 초안 기본값 20, 최댓값 50. 영화 탐색 화면은 10, 랭킹 Top 3는 3을 명시해 요청한다. |
| `cursor` | string | 아니요 | 다음 목록을 요청하는 불투명한 페이지 토큰 |
| `q` | string | 아니요 | **백엔드 확정 전 제안.** 영화 제목 검색어로만 검색한다. 부분 일치·대소문자·공백 정규화 방식도 TBD. |
| `sortBy` | string | 아니요 | `amount` 지정 시 `Movie.totalFundedAmount` 기준 누적 펀딩액순. 생략 시 기본 랜덤 목록 |
| `order` | string | 아니요 | `asc` 또는 `desc`. `sortBy`가 있을 때 정렬 방향 |

### 요청 예시

```http
GET /api/movies?limit=10
GET /api/movies?limit=10&cursor={nextCursor}
GET /api/movies?limit=10&q=%EA%B8%B0%EC%83%9D%EC%B6%A9
GET /api/movies?limit=3&sortBy=amount&order=desc
```

`q`가 있으면 제목만 검색한다. 기본 랜덤 목록은 cursor로 다음 페이지를 조회해도 같은 순서를 유지해야 하며, 검색어/정렬 조건이 바뀌면 첫 페이지부터 다시 요청한다.

### 응답 예시 (200)

```json
{
  "items": [
    {
      "movieId": 1,
      "title": "영화 제목",
      "releaseDate": "2024-01-01",
      "genres": ["드라마", "미스터리"],
      "posterPath": "/example.jpg",
      "productionBudget": "2000000000",
      "totalFundedAmount": "0"
    }
  ],
  "page": {
    "nextCursor": "opaque-token",
    "hasMore": true
  }
}
```

`movieId`는 CineFund DB의 ID다. `releaseDate`에서 화면 표시용 연도를 만들 수 있다. `posterPath`가 전체 URL이 아닌 경로라면 이미지 base URL 조합 규칙을 FE/BE가 함께 정한다. `productionBudget`은 TMDB 원본 숫자(USD)이며 BigInt JSON 직렬화에 따라 문자열 또는 `null`로 전달한다. 목표액 표시가 필요한 화면은 이 숫자를 환율 변환 없이 동일한 숫자의 KRW로 표시한다. `fundingGoal`과 `achievementRate`는 백엔드 PR 계약상 응답 필드가 아니며, 달성률 UI를 유지한다면 FE에서 계산한다.

### 랭킹 Top 3

별도 랭킹 API 대신 목록 조회를 재사용한다.

```http
GET /api/movies?limit=3&sortBy=amount&order=desc
```

누적액 동률은 `movieId` 오름차순으로 고정하는 안을 제안한다. 정렬 및 cursor에서도 동일한 보조 정렬을 적용해야 페이지 간 중복·누락을 줄일 수 있다. 펀딩 데이터가 없을 때는 누적액이 모두 0일 수 있다.

## 4. 영화 상세 조회

`GET /api/movies/{movieId}`

목록/랭킹에서 선택한 영화의 CineFund DB 정보를 조회한다. 단수형 `/api/movie/{id}` 대신 목록과 같은 복수형 경로를 사용하도록 통일한 제안이다.

### Path parameter

| 이름 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `movieId` | integer | 예 | CineFund DB의 영화 ID. 목록 응답의 `movieId` |

### 요청 예시

```http
GET /api/movies/1
```

### 응답 예시 (200)

```json
{
  "movieId": 1,
  "title": "영화 제목",
  "releaseDate": "2024-01-01",
  "genres": ["드라마", "미스터리"],
  "posterPath": "/example.jpg",
  "overview": "영화 줄거리",
  "director": "감독 이름",
  "productionBudget": "1000000",
  "totalFundedAmount": "0"
}
```

`overview`, `director`, `productionBudget`는 백엔드 데이터에 존재하고 화면에서 사용할 때 제공하는 안이다. seed의 `budget`은 숫자 그대로 DB의 `productionBudget`에 매핑하며, seed 코드 주석상 TMDB 원본 제작비(USD)다. 백엔드 PR 스키마에는 별도 `fundingGoal`이 없고 API 초안도 이를 응답하지 않는다. 목표액을 표시하는 프런트엔드는 `productionBudget` 숫자를 환율 계산 없이 동일한 숫자의 KRW로 표시한다. 예: `productionBudget: "225000000"` → `₩225,000,000`. 제작비가 `null`이면 목표액 표시도 불가하다.

## 5. 비교 결과 조회

`POST /api/comparisons`

비교 선택 페이지에서 고른 2~5편의 비교 데이터를 한 번에 조회한다. 비교 결과 페이지 담당자가 결석한 상황을 고려해, 기존 백엔드 참조에 있던 비교 endpoint를 기반으로 정리한 제안이다. 이 요청은 비교 선택을 서버에 저장하거나 펀딩 데이터를 변경하지 않는다.

### 요청 본문

```json
{
  "movieIds": [1, 2]
}
```

`movieIds`는 2~5개의 서로 다른 양의 정수여야 한다. 결과 순서는 요청에 전달한 ID 순서와 같게 반환하는 안을 제안한다.

### 응답 예시 (200)

```json
{
  "items": [
    {
      "movieId": 1,
      "title": "영화 제목 A",
      "releaseDate": "2024-01-01",
      "genres": ["드라마"],
      "posterPath": "/movie-a.jpg",
      "overview": "영화 설명",
      "director": "감독 이름",
      "productionBudget": "1000000",
      "totalFundedAmount": "25000"
    },
    {
      "movieId": 2,
      "title": "영화 제목 B",
      "releaseDate": "2023-05-10",
      "genres": ["미스터리"],
      "posterPath": "/movie-b.jpg",
      "overview": null,
      "director": null,
      "productionBudget": null,
      "totalFundedAmount": "0"
    }
  ]
}
```

예시는 형식 설명용이며 실제 결과는 요청한 영화 수와 같아야 한다. `overview`, `director`, `productionBudget`처럼 DB에 값이 없을 수 있는 항목은 `null`로 반환하는 안이다. 목표액은 FE 표시 규칙으로 `productionBudget`의 숫자를 KRW로 포맷하며, 달성률을 화면에 표시할 경우 FE가 `totalFundedAmount / productionBudget × 100`으로 계산한다. `totalFundedAmount`는 백엔드 PR schema에 저장되는 누적액 필드이며, 집계·갱신은 Funding 관련 정책과 별도로 일관되게 유지해야 한다.

비교 화면에서 필요한 공통 필드는 제목, 개봉일, 장르, 포스터, 줄거리, 감독, 제작비 숫자, 누적 펀딩액으로 제안한다. API는 DB 필드인 `productionBudget`과 `totalFundedAmount`를 반환하고, 목표액(동일 숫자의 KRW 표시)과 달성률은 FE에서 계산한다. AI 요약과 순위는 이 응답에 포함하지 않는다.

### 비교 선택 상태 전달

- 비교 선택 화면은 `GET /api/movies`를 사용해 제목으로 후보를 검색하고, 선택된 `movieId` 배열을 결과 페이지로 전달한다.
- 서버에 선택 상태를 저장하지 않는다. 화면 간 전달은 FE에서 URL query 또는 메모리 상태 중 하나를 정해야 한다. 쿠키/localStorage에 저장하거나 새로고침 후 유지된다고 약속하지 않는다.
- 결과 화면은 전달받은 ID로 `POST /api/comparisons`를 호출한다. 일부 ID가 없을 때 전체 요청을 실패시킬지, 유효한 영화만 반환할지는 팀에서 정해야 한다. 제안은 전체 실패(404)다.

## 6. 오류 및 빈 결과 제안

| 상황 | 상태 코드 제안 | 동작 |
|---|---:|---|
| 제목 검색 결과 없음 | 200 | `items: []`, `hasMore: false` 반환 |
| 잘못된 `limit`, `cursor`, 정렬값 | 400 | 안전한 입력 오류 응답 |
| `movieId`가 정수가 아니거나 0 이하 | 400 | 잘못된 경로 파라미터 |
| 존재하지 않는 상세 영화 | 404 | 영화 없음 응답 |
| 비교 ID 개수가 2~5 범위가 아니거나 중복/잘못된 값 포함 | 400 | 비교 입력 검증 오류 |
| 비교 요청에 존재하지 않는 ID 포함 | 404 | 전체 비교 요청 실패 제안 |
| 서버 또는 DB 오류 | 500 | 내부 SQL, stack, 비밀정보를 제외한 응답 |

정확한 오류 본문 형식과 `400`/`404` 세부 코드는 공통 API 계약에서 확정한다.

## 7. 미확정 사항 및 병목 체크

### 비교 페이지 진행을 막을 수 있는 항목

1. **비교 결과 필드 확정:** 시안에 보이는 항목 중 현재 데이터로 제공 가능한 필드는 제목, 개봉일, 장르, 포스터, 줄거리, 감독, 제작비, 누적액이다. 실제 비교표에 어떤 항목을 표시할지 FE/BE가 맞춰야 한다.
2. **목표액·달성률 제공:** 최신 백엔드 PR은 `fundingGoal` 컬럼과 응답 필드를 제거했다. 프런트엔드에서 `productionBudget` 숫자를 목표액 숫자로 그대로 사용해 원화로 표시하고, 필요하면 누적액과 비교해 달성률을 계산한다.
3. **제작비 표시:** `productionBudget` 원본은 USD 숫자이고, 화면 목표액은 같은 숫자를 KRW로 표시한다. 두 항목은 의미와 단위가 다르므로 화면에서 혼동되지 않도록 레이블을 정한다. 환율 변환은 하지 않는다.
4. **누적액의 단일 기준:** 누적액이 Movie 컬럼인지 Funding 레코드 합계인지, 혹은 캐시인지 최신 백엔드 스키마/구현과 확인해야 한다. 목록, 랭킹, 상세, 비교에서 같은 계산 기준을 사용해야 한다.
5. **영화 없는 경우와 순서:** 비교 ID 중 하나가 없으면 전체 실패(404), 응답은 요청 순서를 유지하는 안이다. 팀 합의가 필요하다.
6. **랜덤 cursor:** 기본 랜덤 목록의 순서 고정 전략이 아직 정해지지 않았다. cursor pagination 구현 전에 백엔드가 기준을 정해야 한다.
7. **제목 검색:** 이 문서는 `q` 파라미터를 제안하지만, 백엔드 PR의 API 명세에는 검색 파라미터가 아직 없다. 비교 선택 화면의 검색과 함께 백엔드 담당자 확인이 필요하다.

### 팀 결정 체크리스트

- [ ] API 담당자가 `/api/comparisons` 경로/POST 방식과 응답 순서를 확정
- [ ] 비교 결과 화면에서 실제 표시할 필드 및 null 처리 확정
- [ ] `fundingGoal`과 `achievementRate`를 API에 추가하지 않고 FE 계산값으로 둘지 팀 합의 확인
- [ ] `productionBudget`이 `null` 또는 0인 영화의 목표액·달성률 화면 처리 확정
- [ ] `totalFundedAmount`의 원천(스키마 필드/펀딩 합계)과 목록·상세·랭킹 간 일관성 확인
- [ ] 제목 검색의 부분 일치, 대소문자, 공백 처리 확정
- [ ] 백엔드가 제목 검색용 `q` 파라미터를 지원할지 확정
- [ ] `limit` 기본/최대값 및 cursor 동작 확정
- [ ] 동률 정렬을 `movieId` 오름차순으로 고정할지 확정
- [ ] 공유 오류 응답 형식 및 API prefix 확정

## 8. 다른 기능 API 상태

펀딩 입력과 코멘트 기능은 서비스 범위/권한/데이터 정책이 확정되지 않았다. 현재 이 문서에서는 계약하지 않는다.

| 기능 | 상태 | 필요한 결정 |
|---|---|---|
| 모의 펀딩 등록 | 미확정 | 입력 필드, 익명 등록 방식, 금액 범위·통화, 기록 및 집계 규칙 |
| 코멘트 목록/수정 | 미확정 | 조회 방식, 수정 권한, 비밀번호 검증, 기간·횟수·정렬 규칙 |
| AI 비교 요약 | 미확정 | MVP 포함 여부, 데이터 처리, 외부 API/비용 및 장애 처리 |

실제 결제, 결제 정보 수집, 로그인/회원가입 API는 현재 범위에 포함하지 않는다.
