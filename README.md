# CineFund (씨네펀드)

> 코드잇 스프린트 16기 3팀 · 영화 모의 펀딩 및 비교 서비스

## 프로젝트 소개

CineFund는 지정된 영화 100편을 탐색하고, 여러 작품을 비교한 뒤 실제 결제 없이 모의 펀딩 기록을 남기는 웹 서비스 프로젝트입니다. 로그인·회원가입이나 결제 기능은 범위에 포함하지 않습니다.

## 목표 기능

- 영화 목록(페이지당 10편), 상세 정보 및 페이지네이션
- 펀딩 금액/달성률 정렬과 랭킹
- 2~5편 영화 비교
- 비로그인 모의 펀딩 UI와 코멘트 조회·비밀번호 수정 UI

FE 화면과 백엔드 API 코드는 구현되어 있습니다. 랭킹 화면은 BE의 전용 `/api/rankings`를 호출하며, 운영 빌드의 기본 API 주소는 Render 백엔드입니다. 실제 브라우저 통합 검증과 제작비 통화 기준은 별도로 확인해야 합니다. TMDB는 초기 데이터 준비에만 사용하며 사용자 화면 요청 때 실시간 호출하지 않습니다.

## 저장소 구성 및 현재 FE 상태

- 저장소: [Sprint-project-1/cine-fund](https://github.com/Sprint-project-1/cine-fund)
- Front-end: Vite + React JSX 기반 scaffold가 있으며 React Router를 사용합니다.
- 영화 탐색/Top 3, 헤더 검색, 비교 후보/결과, 랭킹, 상세 화면이 있으며 각 화면은 CineFund API 호출 코드를 사용합니다. 랭킹은 `GET /api/rankings` 전용 endpoint를 사용합니다. 로컬 Vite 개발 서버는 `/api`를 `http://localhost:3000`에 프록시합니다.
- 백엔드와 DB는 별도 저장소에서 관리합니다. 운영 백엔드는 `https://cinefund-backend.onrender.com`에 배포되어 있으며, 운영 빌드에서 `VITE_API_BASE_URL`을 비우면 이 주소를 기본 사용합니다. 다른 API 호스트를 쓰면 환경변수로 덮어쓸 수 있습니다. 백엔드 `CORS_ORIGINS`에는 배포된 FE의 정확한 origin을 추가해야 합니다. 현재 운영 FE origin은 미정입니다.
- 백엔드에는 `/api/movies`, `/api/rankings`, `/api/comparisons`, 펀딩·코멘트 endpoint가 구현되어 있습니다. API 코드 구현과 DB/HTTP 및 브라우저 통합 검증 상태는 구분해 관리합니다.
- 이 문서 묶음은 FE/BE가 함께 사용하는 요구사항·API·데이터 계약입니다. 저장소별 구현 상태는 대상 저장소를 명시합니다.

## 기술 스택 및 실행

저장소의 `package.json`, `vite.config.js`, `pnpm-lock.yaml` 기준입니다. 새 기술이나 버전을 임의로 추가하지 않습니다.

| 영역 | 현재 확인된 구성 |
|---|---|
| FE | React 19, JSX, Vite 8, React Router 8 |
| 스타일 | Tailwind CSS v4 Vite plugin |
| React 최적화 | React Compiler preset이 Vite 설정에 적용됨 |
| 코드 검사 | ESLint flat config, `pnpm lint` |
| 패키지 매니저 | pnpm, 저장소에 `pnpm-lock.yaml` 존재 |
| BE/DB | Node.js 백엔드, PostgreSQL, Prisma는 별도 백엔드 저장소에서 관리 |

설치 및 실행:

```bash
pnpm install
pnpm dev
```

저장소에 정의된 스크립트:

```bash
pnpm dev      # Vite 개발 서버
pnpm build    # 프런트엔드 빌드
pnpm lint     # ESLint
pnpm preview  # 빌드 결과 미리보기
```

실행에 필요한 pnpm 버전은 저장소에서 `packageManager`로 고정되어 있지 않으므로 팀이 확인해야 합니다. backend/DB 실행 명령은 구현과 설정이 추가된 뒤 이 README에 보완합니다.

## 화면 및 경로

현재 `client/App.jsx`의 구현 경로와 기존 기획 경로는 아래와 같습니다.

| 현재 FE 경로 | 화면 | 기획/Figma 경로 |
|---|---|---|
| `/` | 영화 탐색 | `/` |
| `/detail/:movieId` | 영화 상세 | `/{id}` |
| `/compare` | 영화 비교 선택 | `/comparison` |
| `/compare-result` | 비교 결과 | `/results` |
| `/ranking` | 펀딩 랭킹 | `/ranking` |

영화 탐색은 번호형 페이지 UI와 메모리 cursor 캐시를 사용하고, 랭킹은 cursor API 기반 무한 스크롤을 사용합니다. 상세는 `/detail/:movieId`에서 상세·코멘트·익명 모의 펀딩 API를 호출합니다. 비교 결과는 라우터 메모리 state의 영화 ID로 비교 API를 호출합니다. 페이지별 요청과 상태는 [PAGE_SPEC](docs/PAGE_SPEC.md), API 계약은 [API_SPEC](docs/API_SPEC.md)을 참고하세요.

## 데이터 흐름 계획

구조는 `React UI → CineFund 백엔드 API → Prisma → PostgreSQL`입니다. TMDB는 준비 단계의 Node.js seed/import 작업이 고정된 영화 ID를 기준으로 조회해 PostgreSQL에 적재합니다. PostgreSQL이 TMDB를 직접 호출하지 않으며, 브라우저가 DB에 직접 접속하지 않습니다. 백엔드 API 실행/구현 상태는 백엔드 저장소에서 관리합니다.

## 팀 및 진행 상태

- 팀원과 역할: [ROLE_ASSIGNMENT](docs/ROLE_ASSIGNMENT.md)에서 작성
- 진행 상태: FE 화면/API 호출 코드와 BE endpoint 연결 완료. 제작비 통화 기준 정리, DB/HTTP 및 브라우저 통합 검증은 남아 있음
- Figma: [CineFund 디자인](https://www.figma.com/design/bYyl4ZsROpGqfC7nvNWyTj/시네펀딩-|-영화-탐색·펀딩-UX?node-id=2-6&t=o8qJAmEkbxW6vFaj-1)

## 문서

- 기획: [PROJECT_SPEC](docs/PROJECT_SPEC.md), [PRD](docs/PRD.md), [PAGE_SPEC](docs/PAGE_SPEC.md)
- 설계: [TECH_STACK](docs/TECH_STACK.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [API_SPEC](docs/API_SPEC.md), [DATABASE_SCHEMA](docs/DATABASE_SCHEMA.md)
- 실행 계획: [TASK_BREAKDOWN](docs/TASK_BREAKDOWN.md), [ROLE_ASSIGNMENT](docs/ROLE_ASSIGNMENT.md), [MILESTONES](docs/MILESTONES.md)
- 품질: [SECURITY_POLICY](docs/SECURITY_POLICY.md), [TEST_PLAN](docs/TEST_PLAN.md)
- 협업: [CODING_CONVENTION](docs/conventions/CODING_CONVENTION.md), [GIT_CONVENTION](docs/conventions/GIT_CONVENTION.md), [GROUND_RULES](docs/conventions/GROUND_RULES.md), [AGENTS](AGENTS.md)

## 문서/개발 상태 표기

**확정**은 현재 기획 또는 저장소에서 확인된 사항, **제안**은 팀 검토 사항, **TBD**는 합의가 필요한 사항을 뜻합니다. 계획된 기능과 테스트는 실제 구현·검증 완료로 표현하지 않습니다.
