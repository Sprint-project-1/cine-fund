# 영화 탐색 페이지 API 명세 초안

## 1. 페이지에서 필요한 데이터
- DB에 저장된 영화 목록 100편
- 영화 제목·개봉 연도·장르·포스터
- 펀딩 누적액
- 펀딩 누적액 기준 Top 3
- 영화 제목 검색
- 목록 추가 조회

## 2. 영화 목록 조회
GET /api/movies

### 요청 Query Parameters
이름	타입	필수	설명
limit	number	아니요	한 번에 받을 영화 수. 초안 기본값 10
cursor	string	아니요	다음 목록을 요청하는 불투명한 페이지 토큰
q   	string	아니요	영화 제목 검색어
sortBy	string	아니요	fundingAmount 지정 시 펀딩액순. 생략하면 기본 랜덤
order	string	아니요	asc 또는 desc; 펀딩액 정렬 방향


예시:
GET /api/movies?limit=10
GET /api/movies?limit=10&cursor={nextCursor}
GET /api/movies?limit=10&q=기생충
GET /api/movies?limit=10&sortBy=fundingAmount&order=desc
q가 있으면 영화 제목을 기준으로 검색한다. 제목 부분 일치 여부와 대소문자·공백 처리 방식은 백엔드 구현 전 확정한다.
기본 랜덤 목록은 추가 조회 중 같은 순서를 유지해 중복이나 누락이 생기지 않아야 한다. 이를 cursor에 어떻게 반영할지는 백엔드 담당자와 정한다.

### 응답 예시
{
  "items": [
    {
      "movieId": 1,
      "title": "영화 제목",
      "releaseDate": "2024-01-01",
      "genres": ["드라마", "미스터리"],
      "posterPath": "/example.jpg",
      "totalFundedAmount": "0"
    }
  ],
  "page": {
    "nextCursor": "opaque-token",
    "hasMore": true
  }
}

movieId는 CineFund DB의 영화 ID다. releaseDate로 화면에 표시할 연도를 만들 수 있다. totalFundedAmount는 백엔드 스키마의 BigInt 값이므로 JSON에서는 문자열로 전달하는 안이다.

## 3. 펀딩 순위 Top 3 조회
별도 API 대신 영화 목록 API의 정렬과 개수 제한을 재사용한다.
GET /api/movies?limit=3&sortBy=fundingAmount&order=desc
펀딩액이 같은 영화의 순서는 movieId 오름차순으로 고정하는 안을 제안한다. 아직 펀딩 기록이 없는 영화는 누적액이 0원이므로 초기에는 Top 3가 모두 0원일 수 있다.

## 4. 영화 선택
영화 카드를 누르면 해당 영화의 상세 페이지로 이동한다. 상세 조회 API는 상세 페이지 담당자 명세에서 다룬다. 목록 응답에는 상세로 이동하는 데 필요한 movieId를 포함한다.

## 5. 오류 및 빈 목록 처리
상황	                                처리제안
검색 결과 없음	                        200과 빈 items 배열 반환
잘못된 limit, cursor, 정렬값	        400 반환
서버 또는 DB 오류	                    내부 정보 없이 500 반환


## 6. 현재 데이터 구조와 확인할 점
백엔드 스키마에는 영화 제목, 개봉일, 장르, 포스터 경로, 누적 펀딩액이 있다. 다만 펀딩 목표액 필드는 없어 달성률을 계산할 수 없다. 따라서 현재 화면의 목표액·달성률 막대는 이 API만으로 제공할 수 없다. 목표액 정책을 팀에서 결정한 뒤 화면/API를 함께 조정해야 한다.
