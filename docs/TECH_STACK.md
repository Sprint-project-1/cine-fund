# 기술 스택 및 협업 도구

> 현재 구현 상태는 GitHub `main`의 `package.json`, `pnpm-lock.yaml`, `vite.config.js`, `eslint.config.js`를 확인한 결과다. 백엔드/DB 항목은 프로젝트 계획이며 현재 저장소 구현과 구분한다.

## 현재 저장소에서 확인된 기술

| 영역 | 확인 상태 | 구성 |
|---|---|---|
| Front-end | 저장소 적용됨 | React + JSX, HTML, CSS, JavaScript |
| 개발 서버/빌드 | 저장소 적용됨 | Vite; `pnpm dev`, `pnpm build`, `pnpm preview` |
| 라우팅 | 의존성 및 코드 적용됨 | React Router; 실제 앱 경로는 `client/App.jsx` 참조 |
| CSS 도구 | 설정 적용됨, 의존성 확인 필요 | `@tailwindcss/vite` v4 plugin, CSS에서 `@import "tailwindcss"` 사용 |
| React Compiler | 설정 적용됨 | `vite.config.js`에서 `reactCompilerPreset()` 연결 |
| 패키지 매니저 | 저장소 적용됨 | pnpm, `pnpm-lock.yaml` 존재 |
| 린트 | 저장소 적용됨 | ESLint flat config, `pnpm lint`; ESLint React Hooks/Refresh 규칙 포함 |
| 형식화 | TBD | Prettier는 현재 `package.json`에서 확인되지 않음 |
| Back-end | 계획 | Node.js; 서버 프레임워크 미정, Express 확정 아님 |
| ORM / DB | 계획 | Prisma / PostgreSQL; 현재 `main`에 schema/migration 없음 |
| TMDB | 계획 | 초기 seed/import 작업에서 고정된 영화 100편을 조회해 DB에 저장. 런타임 화면 조회에서 호출하지 않음 |

`package.json`에 기재된 버전 범위는 manifest와 lockfile을 기준으로 설치된다. pnpm의 정확한 버전은 저장소에서 고정되지 않았으므로 팀이 결정할 항목이다. 프런트엔드 React Router 의존성과 페이지 scaffold가 존재하지만, 서비스 기능과 최종 URL 계약은 아직 확정/완료되지 않았다.

### 저장소 설정 확인이 필요한 항목

현재 `package.json`은 Tailwind 의존성 이름으로 `tailwind`를 선언하고, Vite plugin/CSS import는 Tailwind CSS v4 구성 형태다. Tailwind 공식 Vite 설치 안내는 `tailwindcss`와 `@tailwindcss/vite`를 함께 설치하도록 설명하므로, 저장소 담당자가 lockfile과 `pnpm install`, `pnpm build` 결과를 확인해 의존성 이름이 의도한 것인지 점검해야 한다. 이 문서는 원격 `main`을 임의 수정하지 않았다. [Tailwind 공식 Vite 설치 안내](https://tailwindcss.com/docs/installation/using-vite)

## 개발 환경 및 협업

- 저장소: [Sprint-project-1/cine-fund](https://github.com/Sprint-project-1/cine-fund), 기본 브랜치 `main` 확인.
- 실행: `pnpm install`, `pnpm dev`; 확인된 검사 스크립트는 `pnpm lint`, 빌드는 `pnpm build`.
- 저장소 루트가 현재 프런트엔드 앱 루트다. 향후 백엔드를 같은 저장소에 둘지 별도 저장소로 둘지는 TBD.
- PostgreSQL은 팀원별 Docker 로컬 인스턴스 사용을 제안한다. 공통 Prisma schema/migration/seed가 DB 구조를 맞추고 각자의 데이터는 로컬에 둔다. Docker Compose 도입, DB 버전과 실행 명령은 TBD.
- GitHub Issue/PR로 작업·리뷰를 관리한다. 프로젝트 보드와 소통 채널(Discord 등)은 팀 합의가 필요하다.
- 외부 DB 호스팅, FE/BE 배포 플랫폼과 도메인은 후보 조사 후 결정한다.

## 코드 품질 정책

현재 저장소의 ESLint flat config를 기준으로 사용한다. Prettier와 Airbnb 규칙은 현재 설치/적용 사실이 확인되지 않으므로 활성화된 것처럼 문서화하지 않는다. 필요하면 저장소의 현재 ESLint major, flat config, React plugin과의 호환성을 확인해 별도 PR로 합의한다. 기존 CRA 중심 ESLint 설정을 그대로 복사하지 않는다. 상세 규칙은 [코딩 컨벤션](conventions/CODING_CONVENTION.md)을 따른다.

## 기술 선택의 이유와 리스크

| 기술/방식 | 이점 | 주의할 점 |
|---|---|---|
| React + JSX | 기획에서 정한 UI 개발 방식이며 컴포넌트 단위로 화면 구성 가능 | 앱 상태와 서버 데이터 상태를 구분하고 컴포넌트 책임을 관리 |
| Vite | 저장소에 설정된 개발 서버/빌드 도구 | 배포 경로/base 설정은 배포 환경에 맞춰 확인 |
| React Router | 페이지 scaffold의 라우팅에 사용 | 현재 구현 경로와 기존 기획 경로가 일부 다름 |
| Tailwind CSS v4 | 현재 Vite plugin 및 의존성 설정에 포함 | 디자인 토큰/클래스 사용 규칙을 팀이 정리할 필요 |
| React Compiler | 현재 Vite/Babel 설정에서 활성화 | 개발/빌드 성능에 영향 가능; 설정을 바꿀 때 빌드 확인 |
| ESLint | 현재 코드 검사 스크립트와 flat config가 존재 | 팀 규칙 추가 전 기존 구성 및 ESLint 10 호환 확인 |
| Node.js + Prisma + PostgreSQL | 서버 계층과 관계형 데이터/마이그레이션을 계획 | 현재 저장소에는 구현 없음; 버전·환경·동시성 설계 필요 |
| TMDB seed/import | 지정된 영화 메타데이터를 로컬 DB에 적재해 런타임 의존 감소 | 고정 ID 100개, API 키, 호출 실패/재실행·데이터 라이선스 정책 관리 |

## 실행 및 배포

현재 프런트엔드 개발/빌드/lint 명령은 저장소 README의 `pnpm` 명령을 사용한다. 백엔드, DB, seed/import 실행 및 배포 절차는 해당 설정과 구현이 저장소에 추가된 뒤 갱신한다. 각 환경의 비밀값은 환경변수로 관리하고 저장소에 올리지 않는다.
