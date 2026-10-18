import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

// ==========================================
// API 연결 전 화면 확인용 샘플 데이터
// 실제 API가 준비되면 movies prop으로 전달하세요.
const sampleMovies = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `샘플 영화 ${String(i + 1).padStart(2, "0")}`,
  director: "홍길동",
  posterUrl: null,
  fundingAmount: (i + 1) * 1_350_000,
  targetAmount: 50_000_000 + (i % 6) * 15_000_000,
}));

const sortOptions = [
  { value: "funding-desc", label: "펀딩 금액 높은 순" },
  { value: "funding-asc", label: "펀딩 금액 낮은 순" },
  { value: "rate-desc", label: "펀딩 달성률 높은 순" },
  { value: "rate-asc", label: "펀딩 달성률 낮은 순" },
];

const money = (value) => `₩ ${Number(value || 0).toLocaleString("ko-KR")}`;
const rateOf = (movie) =>
  movie.targetAmount > 0 ? (movie.fundingAmount / movie.targetAmount) * 100 : 0;
const rateText = (movie) => `${Math.round(rateOf(movie))}%`;

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
  const percent = Math.max(0, Math.min(rateOf(movie), 100));
  return (
    <div className="min-w-0">
      <strong className="text-sm font-bold text-teal-700">
        {rateText(movie)}
      </strong>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-label={`${movie.title} 펀딩 달성률`}
        aria-valuenow={Math.round(percent)}
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
      to={`/movies/${movie.id}`} // 실제 팀 영화 상세 경로가 다르면 이 부분만 변경
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
// 페이지: LayoutPage의 <Outlet /> 위치에 표시됩니다.
export default function RankingPage({ movies = sampleMovies }) {
  const [sort, setSort] = useState("funding-desc");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);
  const sentinelRef = useRef(null);

  const sortedMovies = useMemo(() => {
    // 같은 영화 중복 제외 → 정렬. 모든 정렬에 ID 오름차순 보조 기준 적용
    const uniqueMovies = [
      ...new Map(movies.map((movie) => [movie.id, movie])).values(),
    ];
    return uniqueMovies.sort((a, b) => {
      const diff = sort.startsWith("funding")
        ? a.fundingAmount - b.fundingAmount
        : rateOf(a) - rateOf(b);
      return (sort.endsWith("desc") ? -diff : diff) || a.id - b.id;
    });
  }, [movies, sort]);

  const visibleMovies = sortedMovies.slice(0, visibleCount);
  const hasMore = visibleCount < sortedMovies.length;
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

  useEffect(() => {
    if (!hasMore || isLoading || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsLoading(true);
      },
      { rootMargin: "180px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, visibleCount, sort]);

  useEffect(() => {
    if (!isLoading) return;
    // 샘플 데이터라 400ms 로딩 연출. 실제 API 연결 시 요청으로 교체
    const timer = setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 10, sortedMovies.length));
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [isLoading, sortedMovies.length]);

  const handleSort = (nextSort) => {
    setSort(nextSort);
    setVisibleCount(10);
    setIsLoading(false);
    setMenuOpen(false);
  };

  return (
    <section className="w-full pb-16">
      <div className="mb-[30px] flex flex-wrap items-end justify-between gap-5">
        <div className="pl-2">
          <p className="mb-3 text-xs font-bold tracking-wide text-[#037069]">
            RANKING
          </p>

          <h1 className="text-3xl font-bold leading-tight tracking-[-0.04em] min-[621px]:text-4xl">
            펀딩 랭킹
          </h1>

          <p className="mt-[13px] text-[15px] text-[#697180]">
            조건별 랭킹을 확인하고, 아래로 스크롤하면 다음 영화가 이어집니다.
          </p>
        </div>
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
          {sortedMovies.length === 0
            ? "표시할 영화가 없습니다."
            : `1–${visibleMovies.length}위 · ${hasMore ? "계속 스크롤해 더 보기" : "모든 랭킹을 확인했습니다"}`}
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
        {visibleMovies.map((movie, index) => (
          <RankingItem key={movie.id} movie={movie} rank={index + 1} />
        ))}
        {sortedMovies.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-500">
            아직 등록된 영화가 없습니다.
          </p>
        )}
        {isLoading && <LoadingSkeleton />}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden="true" />}
      {!hasMore && sortedMovies.length > 0 && (
        <p className="mt-7 text-center text-xs text-gray-500">
          모든 랭킹을 확인했습니다.
        </p>
      )}
    </section>
  );
}
