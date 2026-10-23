import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import PageHeading from "../components/PageHeading.jsx";

// 백엔드 API와 같은 정렬 키를 사용합니다.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
const SORT_QUERY = {
  "funding-desc": { sortBy: "amount", order: "desc" },
  "funding-asc": { sortBy: "amount", order: "asc" },
  "rate-desc": { sortBy: "achievementRate", order: "desc" },
  "rate-asc": { sortBy: "achievementRate", order: "asc" },
};

// 응답: movieId / posterPath / totalFundedAmount / productionBudget
// 화면: id / posterUrl / fundingAmount / targetAmount
function toRankingMovie(movie) {
  return {
    id: movie.movieId,
    title: movie.title,
    director: movie.director ?? "정보 없음",
    posterUrl: movie.posterPath
      ? `https://image.tmdb.org/t/p/w185${movie.posterPath}`
      : null,
    fundingAmount: movie.totalFundedAmount, // 큰 정수이므로 문자열 유지
    targetAmount: movie.productionBudget, // null일 수 있음
  };
}

const sortOptions = [
  { value: "funding-desc", label: "펀딩 금액 높은 순" },
  { value: "funding-asc", label: "펀딩 금액 낮은 순" },
  { value: "rate-desc", label: "펀딩 달성률 높은 순" },
  { value: "rate-asc", label: "펀딩 달성률 낮은 순" },
];

const money = (value) =>
  value === null || value === undefined
    ? "—"
    : `₩ ${BigInt(value).toLocaleString("ko-KR")}`;

function rateOf(movie) {
  if (movie.targetAmount === null || BigInt(movie.targetAmount) <= 0n)
    return null;
  // 큰 정수는 BigInt로 계산하며 화면에는 소수점 2자리까지 사용
  return (
    Number(
      (BigInt(movie.fundingAmount) * 10000n) / BigInt(movie.targetAmount),
    ) / 100
  );
}

const rateText = (movie) => {
  const percent = rateOf(movie);
  return percent === null ? "산정 불가" : `${Math.round(percent)}%`;
};

function Poster({ movie, className = "" }) {
  return movie.posterUrl ? (
    <img
      src={movie.posterUrl}
      alt={`${movie.title} 포스터`}
      loading="lazy"
      className={`shrink-0 rounded-lg object-contain ${className}`}
    />
  ) : (
    <div
      aria-label="포스터 없음"
      className={`flex shrink-0 items-center justify-center rounded-lg bg-[#61506e] text-[10px] text-white/75 ${className}`}
    >
      포스터
    </div>
  );
}

function Progress({ movie }) {
  const rate = rateOf(movie);
  const percent = rate === null ? 0 : Math.max(0, Math.min(rate, 100));
  return (
    <div className="min-w-0">
      <strong className="text-sm font-bold text-teal-700">
        {rateText(movie)}
      </strong>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-label={`${movie.title} 펀딩 달성률`}
        aria-valuenow={rate === null ? undefined : Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-teal-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function RankingItem({ movie, rank }) {
  return (
    <Link
      to="/detail" // 현재 App.jsx에 등록된 상세 경로 (상세 담당자가 state.movieId를 읽어야 함)
      state={{ movieId: movie.id }}
      className="block rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-teal-300 hover:bg-teal-50/30 focus-visible:outline-2 focus-visible:outline-teal-700 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:border-b lg:px-4 lg:py-3"
    >
      {/* 모바일: 카드 형태 */}
      <div className="lg:hidden">
        <div className="flex items-start gap-3">
          <span className="w-7 pt-1 text-sm font-bold text-teal-700">
            {String(rank).padStart(2, "0")}
          </span>
          <Poster movie={movie} className="h-[84px] w-[56px]" />
          <div className="min-w-0 flex-1 pt-1">
            <p className="truncate font-semibold text-gray-900">
              {movie.title}
            </p>
            <p className="mt-1 truncate text-xs text-gray-500">
              감독 · {movie.director}
            </p>
          </div>
          <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
            상세
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs text-gray-500">현재 금액</p>
            <p className="break-words text-xs font-bold text-gray-900">
              {money(movie.fundingAmount)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs text-gray-500">목표 금액</p>
            <p className="break-words text-xs font-bold text-gray-900">
              {money(movie.targetAmount)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs text-gray-500">달성률</p>
            <Progress movie={movie} />
          </div>
        </div>
      </div>

      {/* 데스크톱: PDF의 표 형태 */}
      <div className="hidden items-center gap-3 lg:grid lg:grid-cols-[44px_minmax(180px,1fr)_145px_145px_125px_60px]">
        <span className="text-sm font-bold text-teal-700">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="flex min-w-0 items-center gap-3">
          <Poster movie={movie} className="h-[84px] w-[56px]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              {movie.title}
            </p>
            <p className="mt-1 truncate text-xs text-gray-500">
              감독 · {movie.director}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {money(movie.fundingAmount)}
        </span>
        <span className="text-sm text-gray-700">
          {money(movie.targetAmount)}
        </span>
        <Progress movie={movie} />
        <span className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-xs font-medium text-gray-700">
          상세
        </span>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="space-y-3 py-3"
      role="status"
      aria-label="다음 랭킹 불러오는 중"
    >
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
      ))}
      <p className="text-center text-xs text-gray-500">
        다음 랭킹 불러오는 중...
      </p>
    </div>
  );
}

// ==========================================
// RankingPage: 실제 백엔드 API + cursor 기반 무한 스크롤
export default function RankingPage() {
  const [sort, setSort] = useState("funding-desc");
  const [menuOpen, setMenuOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState({ nextCursor: null, hasMore: true });
  const [requestCursor, setRequestCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const menuRef = useRef(null);
  const sentinelRef = useRef(null);

  // 정렬 변경 → 서버에 첫 페이지 요청. 스크롤 → 서버 cursor로 다음 10개 요청.
  useEffect(() => {
    const controller = new AbortController();
    const { sortBy, order } = SORT_QUERY[sort];
    const params = new URLSearchParams({ limit: "10", sortBy, order });
    if (requestCursor) params.set("cursor", requestCursor);

    fetch(`${API_BASE_URL}/api/rankings?${params}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`서버 응답 ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.items) || !data.page) {
          throw new Error("예상한 영화 목록 응답 형식이 아닙니다.");
        }
        const incoming = data.items.map(toRankingMovie);
        setMovies((previous) => {
          if (!requestCursor) return incoming;
          // 펀딩액 갱신으로 순위가 이동할 때 같은 영화 중복 노출 방지
          const knownIds = new Set(previous.map((movie) => movie.id));
          return [
            ...previous,
            ...incoming.filter((movie) => !knownIds.has(movie.id)),
          ];
        });
        setPage(data.page);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort(); // 정렬 변경/언마운트 시 이전 요청 취소
  }, [sort, requestCursor, retry]);

  const hasMore = Boolean(page.hasMore && page.nextCursor);
  const activeLabel = sortOptions.find(
    (option) => option.value === sort,
  )?.label;

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  // 다음 페이지가 있을 때만 바닥 감지 → nextCursor 요청
  useEffect(() => {
    if (isLoading || error || !hasMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoading(true); // 다음 페이지 로딩 시작
          setError(""); // 이전 오류 초기화
          setRequestCursor(page.nextCursor); // 다음 페이지 요청
        }
      },
      { rootMargin: "180px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, error, page.nextCursor]);

  const handleSort = (nextSort) => {
    setMenuOpen(false);
    if (nextSort === sort) return;
    setMovies([]);
    setPage({ nextCursor: null, hasMore: true });
    setRequestCursor(null); // 이전 정렬에서 받은 cursor는 절대 재사용하지 않음
    setIsLoading(true);
    setError("");
    setSort(nextSort);
  };

  return (
    <section className="w-full pb-16">
      <div className="mb-[30px] flex flex-wrap items-end justify-between gap-5">
        <PageHeading
          id="ranking-title"
          eyebrow="RANKING"
          title="펀딩 랭킹"
          description="조건별 랭킹을 확인하고, 아래로 스크롤하면 다음 영화가 이어집니다."
        />
      </div>

      <div className="mb-5 mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="shrink-0 text-xs font-medium text-gray-500">
            정렬 기준
          </span>
          <div className="relative w-full sm:w-72" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm font-semibold text-gray-900 transition ${menuOpen ? "border-teal-600 ring-1 ring-teal-600" : "border-gray-200 hover:border-gray-300"}`}
            >
              {activeLabel}
              <span
                className={`ml-3 text-teal-700 transition ${menuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>
            {menuOpen && (
              <div
                role="listbox"
                aria-label="펀딩 랭킹 정렬 기준"
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={sort === option.value}
                    onClick={() => handleSort(option.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm hover:bg-gray-50 ${sort === option.value ? "bg-teal-50 font-bold text-teal-700" : "text-gray-700"}`}
                  >
                    {option.label}
                    {sort === option.value && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {movies.length === 0
            ? isLoading
              ? "랭킹 불러오는 중..."
              : "표시할 영화가 없습니다."
            : `1–${movies.length}위 · ${hasMore ? "계속 스크롤해 더 보기" : "모든 랭킹을 확인했습니다"}`}
        </p>
      </div>

      <div className="space-y-3 lg:space-y-0 lg:rounded-2xl lg:border lg:border-gray-200 lg:bg-white lg:px-4">
        <div className="hidden items-center gap-3 border-b border-gray-200 px-4 py-4 text-xs font-semibold text-gray-500 lg:grid lg:grid-cols-[44px_minmax(180px,1fr)_145px_145px_125px_60px]">
          <span>순위</span>
          <span>영화</span>
          <span>현재 펀딩액</span>
          <span>목표 금액</span>
          <span>달성률</span>
          <span className="sr-only">상세</span>
        </div>
        {movies.map((movie, index) => (
          <RankingItem key={movie.id} movie={movie} rank={index + 1} />
        ))}
        {movies.length === 0 && !isLoading && !error && (
          <p className="py-16 text-center text-sm text-gray-500">
            아직 등록된 영화가 없습니다.
          </p>
        )}
        {isLoading && <LoadingSkeleton />}
        {error && (
          <div role="alert" className="py-6 text-center text-sm text-red-700">
            랭킹을 불러오지 못했습니다. ({error})
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => {
                setIsLoading(true); // 재요청 시작
                setError(""); // 기존 오류 초기화
                setRetry((n) => n + 1);
              }}
            >
              다시 시도
            </button>
          </div>
        )}
      </div>

      {hasMore && !error && (
        <div ref={sentinelRef} className="h-8" aria-hidden="true" />
      )}
      {!hasMore && !isLoading && !error && movies.length > 0 && (
        <p className="mt-7 text-center text-xs text-gray-500">
          모든 랭킹을 확인했습니다.
        </p>
      )}
    </section>
  );
}
