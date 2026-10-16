# CineFund (씨네펀드)

> 코드잇 스프린트 16기 3팀 · 영화 모의 펀딩 및 비교 서비스

## 프로젝트 소개

CineFund는 지정된 영화 100편을 탐색하고, 여러 작품을 비교한 뒤 실제 결제 없이 모의 펀딩 기록을 남기는 웹 서비스 프로젝트입니다. 로그인·회원가입이나 결제 기능은 범위에 포함하지 않습니다.

## 목표 기능

- 영화 목록(페이지당 10편), 상세 정보 및 페이지네이션
- 펀딩 금액/달성률 정렬과 랭킹
- 2~5편 영화 비교
- 비로그인 모의 펀딩 UI와 코멘트 조회·비밀번호 수정 UI

기능 UI와 서버 저장 정책은 별개입니다. 펀딩 등록·수정의 요청/검증 방식은 API 담당자와 합의 전까지 확정하지 않았습니다. TMDB는 준비 단계에서 영화 데이터를 가져와 DB에 저장하는 데 사용하며, 화면 요청 때 실시간 호출하는 구조가 아닙니다.

## 현재 저장소 상태 (`main` 확인 기준)

- 저장소: [Sprint-project-1/cine-fund](https://github.com/Sprint-project-1/cine-fund)
- Front-end: Vite + React JSX 기반 scaffold가 있으며 React Router를 사용합니다.
- 영화 탐색·상세·비교 선택·펀딩 랭킹의 화면 UI가 `main`에 반영되어 있습니다. 화면은 예시 데이터 기반이며 실제 백엔드/API 연동이 끝난 상태는 아닙니다.
- 비교 결과 페이지는 현재 placeholder입니다. 상세 화면은 고정된 예시 영화 데이터를 사용하고, 영화 ID를 경로로 전달하지 않습니다.
- 현재 확인한 저장소 트리에는 백엔드 서버, Prisma schema/migration, PostgreSQL 설정 및 seed/import 코드가 없습니다.
- 프로젝트 명세와 개발 문서는 `docs/` 아래 관리합니다.

## 기술 스택 및 실행

저장소의 `package.json`, `vite.config.js`, `pnpm-lock.yaml` 기준입니다. 새 기술이나 버전을 임의로 추가하지 않습니다.

| 영역 | 현재 확인된 구성 |
|---|---|
| FE | React 19, JSX, Vite 8, React Router 8 |
| 스타일 | Tailwind CSS v4 Vite plugin |
| React 최적화 | React Compiler preset이 Vite 설정에 적용됨 |
| 코드 검사 | ESLint flat config, `pnpm lint` |
| 패키지 매니저 | pnpm, 저장소에 `pnpm-lock.yaml` 존재 |
| BE/DB | Node.js 백엔드, PostgreSQL, Prisma는 프로젝트 계획. 아직 현재 `main` 구현에 없음 |

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

현재 `client/App.jsx`의 구현 경로는 아래와 같습니다. 기존 기획/Figma의 경로와 다른 부분이 있어 API·라우팅 합의가 필요합니다.

| 현재 `main` 경로 | 화면 | 기존 기획 경로 |
|---|---|---|
| `/` | 예시 데이터 기반 영화 탐색 UI | `/` |
| `/detail` | 고정 예시 영화 기반 상세 UI (ID 파라미터 없음) | `/{id}` |
| `/compare` | 예시 영화 기반 비교 선택 UI | `/comparison` |
| `/compare-result` | placeholder | `/results` |
| `/ranking` | 예시 데이터 기반 랭킹 UI | `/ranking` |

화면 UI 구현과 실제 서비스 기능/API 연동은 구분합니다. 랭킹의 상세 링크 경로와 영화 상세의 동적 ID 전달 등 최종 경로 계약은 팀이 결정해야 합니다. 화면 동작과 미완료 범위는 [PAGE_SPEC](docs/PAGE_SPEC.md)을 참고하세요.

## 데이터 흐름 계획

계획 구조는 `React UI → CineFund 백엔드 API → Prisma → PostgreSQL`입니다. TMDB는 준비 단계의 Node.js seed/import 작업이 고정된 영화 ID를 기준으로 조회해 PostgreSQL에 적재합니다. PostgreSQL이 TMDB를 직접 호출하지 않으며, 브라우저가 DB에 직접 접속하지 않습니다. 백엔드/API/DB는 아직 저장소에 구현되어 있지 않습니다.

## 팀 및 진행 상태

- 팀원과 역할: [ROLE_ASSIGNMENT](docs/ROLE_ASSIGNMENT.md)에서 작성
- 진행 상태: 주요 페이지 UI가 `main`에 반영됨. 예시 데이터 기반이며 백엔드/API 연동과 통합 검증은 후속 작업
- Figma: [CineFund 디자인](https://www.figma.com/design/bYyl4ZsROpGqfC7nvNWyTj/시네펀딩-|-영화-탐색·펀딩-UX?node-id=2-6&t=o8qJAmEkbxW6vFaj-1)

## 문서

- 기획: [PROJECT_SPEC](docs/PROJECT_SPEC.md), [PRD](docs/PRD.md), [PAGE_SPEC](docs/PAGE_SPEC.md)
- 설계: [TECH_STACK](docs/TECH_STACK.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [API_SPEC](docs/API_SPEC.md), [DATABASE_SCHEMA](docs/DATABASE_SCHEMA.md)
- 실행 계획: [TASK_BREAKDOWN](docs/TASK_BREAKDOWN.md), [ROLE_ASSIGNMENT](docs/ROLE_ASSIGNMENT.md), [MILESTONES](docs/MILESTONES.md)
- 품질: [SECURITY_POLICY](docs/SECURITY_POLICY.md), [TEST_PLAN](docs/TEST_PLAN.md)
- 협업: [CODING_CONVENTION](docs/conventions/CODING_CONVENTION.md), [GIT_CONVENTION](docs/conventions/GIT_CONVENTION.md), [GROUND_RULES](docs/conventions/GROUND_RULES.md), [AGENTS](AGENTS.md)

## 문서/개발 상태 표기

**확정**은 현재 기획 또는 저장소에서 확인된 사항, **제안**은 팀 검토 사항, **TBD**는 합의가 필요한 사항을 뜻합니다. 계획된 기능과 테스트는 실제 구현·검증 완료로 표현하지 않습니다.
