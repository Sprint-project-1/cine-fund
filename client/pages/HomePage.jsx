import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchMovies, toMovieCard } from "../api/movies.js";
import PageHeading from "../components/PageHeading.jsx";
import SkeletonBlock from "../components/SkeletonBlock.jsx";

const MOVIES_PER_PAGE = 10;

function formatAmount(amount) {
  return `₩ ${new Intl.NumberFormat("ko-KR").format(BigInt(amount || "0"))}`;
}

function getAchievement(movie) {
  if (!movie.targetAmount || BigInt(movie.targetAmount) === 0n) return null;
  return Number((BigInt(movie.raisedAmount) * 100n) / BigInt(movie.targetAmount));
}

function Poster({ movie, featured = false }) {
  const [hasError, setHasError] = useState(false);
  const showImage = movie.posterUrl && !hasError;

  return (
    <div
      className={`relative flex aspect-[2/3] flex-none items-end overflow-hidden rounded-lg bg-[#eef0f3] text-white/80 ${featured ? "w-full" : ""}`}
      role="img"
      aria-label={`${movie.title} 포스터`}
    >
      {showImage ? (
        <img
          src={movie.posterUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="relative z-10 pb-[14px] pl-[14px] text-[11px] tracking-[0.04em]">포스터 없음</span>
      )}
      <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgb(13_18_28/35%)] to-transparent" />
    </div>
  );
}

function FundingProgress({ movie, featured = false, compact = false }) {
  const achievement = getAchievement(movie);

  return (
    <div className={`${featured ? "mt-4" : compact ? "mt-[10px]" : "mt-[14px]"}`}>
      <div
        className={`overflow-hidden rounded-full bg-[#e9ecef] ${featured ? "h-2" : compact ? "h-[5px]" : "h-1.5"}`}
        role="progressbar"
        aria-label={`${movie.title} 펀딩 달성률`}
        aria-valuemin="0"
        aria-valuemax="100"
        {...(achievement === null ? {} : { "aria-valuenow": Math.min(achievement, 100) })}
      >
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${achievement === null ? 0 : Math.min(achievement, 100)}%` }}
        />
      </div>
      <p className={`mt-[9px] mb-0 flex justify-between gap-2 leading-[1.4] text-[#697180] ${featured ? "text-xs" : compact ? "mt-[7px] text-[10px] max-[620px]:text-[9px]" : "text-[11px]"}`}>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#414957]">{formatAmount(movie.raisedAmount)}</span>
        <span>{achievement === null ? "달성률 계산 불가" : `${achievement}% 달성`}</span>
      </p>
    </div>
  );
}

function MovieCard({ movie, onOpen }) {
  return (
    <button
      type="button"
      className="flex min-w-0 cursor-pointer flex-col rounded-[10px] border border-[#e8eaee] bg-white p-3 text-left transition-[transform,box-shadow] duration-[160ms] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgb(22_26_34/9%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[rgb(3_112_105/35%)] max-[620px]:rounded-lg max-[620px]:p-2"
      onClick={() => onOpen(movie)}
    >
      <Poster movie={movie} />
      <span className="mt-3 block overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold text-[#161a22] max-[620px]:mt-[9px] max-[620px]:text-[13px]">{movie.title}</span>
      <span className="mt-[5px] block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#697180] max-[620px]:text-[10px]">{movie.genres.join(" · ") || "장르 미정"} · {movie.year || "개봉일 미정"}</span>
      <FundingProgress movie={movie} compact />
    </button>
  );
}

function RankedMovieCard({ movie, onOpen }) {
  return (
    <button
      type="button"
      className="relative flex min-w-0 cursor-pointer snap-start flex-col items-stretch rounded-xl border border-[#e8eaee] bg-white p-[14px] text-left transition-[transform,box-shadow] duration-[160ms] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgb(22_26_34/9%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[rgb(3_112_105/35%)] max-[620px]:rounded-[10px] max-[620px]:p-[10px]"
      onClick={() => onOpen(movie)}
    >
      <Poster movie={movie} featured />
      <span className="mt-[18px] block overflow-hidden text-ellipsis whitespace-nowrap text-[19px] font-bold text-[#161a22] max-[620px]:mt-3 max-[620px]:text-base">{movie.title}</span>
      <span className="mt-[7px] block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#697180] max-[620px]:text-[11px]">{movie.genres.join(" · ") || "장르 미정"} · {movie.year || "개봉일 미정"}</span>
      <FundingProgress movie={movie} featured />
    </button>
  );
}

function RankedMovieCardSkeleton() {
  return (
    <div className="min-w-0 snap-start rounded-xl border border-[#e8eaee] bg-white p-[14px] max-[620px]:rounded-[10px] max-[620px]:p-[10px]">
      <SkeletonBlock className="aspect-[2/3] w-full rounded-lg" />
      <SkeletonBlock className="mt-[18px] h-6 w-3/4 max-[620px]:mt-3" />
      <SkeletonBlock className="mt-[7px] h-4 w-1/2" />
      <SkeletonBlock className="mt-4 h-2 w-full rounded-full" />
      <div className="mt-[9px] flex justify-between gap-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
    </div>
  );
}

function MovieCardSkeleton() {
  return (
    <div className="min-w-0 rounded-[10px] border border-[#e8eaee] bg-white p-3 max-[620px]:rounded-lg max-[620px]:p-2">
      <SkeletonBlock className="aspect-[2/3] w-full rounded-lg" />
      <SkeletonBlock className="mt-3 h-5 w-4/5 max-[620px]:mt-[9px]" />
      <SkeletonBlock className="mt-[5px] h-4 w-3/5" />
      <SkeletonBlock className="mt-[10px] h-[5px] w-full rounded-full" />
      <div className="mt-[7px] flex justify-between gap-2">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-14" />
      </div>
    </div>
  );
}

function ScrollRail({ children, label }) {
  return (
    <div className="relative w-full min-w-0 max-w-full">
      <div
        className="grid w-full min-w-0 max-w-full auto-cols-[minmax(0,1fr)] grid-flow-col gap-6 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory px-[2px] pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[1023px]:auto-cols-[minmax(260px,44%)] max-[1023px]:gap-[18px] max-[620px]:auto-cols-[minmax(72%,1fr)] max-[620px]:gap-3 max-[620px]:mr-[-16px] max-[620px]:pr-4 motion-reduce:scroll-auto"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get("q") ?? "").trim();
  const [pagination, setPagination] = useState({ query: searchTerm, page: 1 });
  const currentPage = pagination.query === searchTerm ? pagination.page : 1;
  const cursorCache = useRef({
    query: searchTerm,
    byPage: new Map([[1, undefined]]),
  });
  const [lastPage, setLastPage] = useState(null);
  const [isResolvingPage, setIsResolvingPage] = useState(false);
  const navigationId = useRef(0);
  const [moviePage, setMoviePage] = useState({ items: [], page: { hasMore: false, nextCursor: null } });
  const [topMovies, setTopMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopLoading, setIsTopLoading] = useState(true);
  const [error, setError] = useState("");
  const [topError, setTopError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (cursorCache.current.query === searchTerm) return;

    cursorCache.current = { query: searchTerm, byPage: new Map([[1, undefined]]) };
    setPagination({ query: searchTerm, page: 1 });
    setLastPage(null);
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    setMoviePage({ items: [], page: { hasMore: false, nextCursor: null } });

    fetchMovies(
      {
        limit: MOVIES_PER_PAGE,
        cursor: cursorCache.current.byPage.get(currentPage),
        q: searchTerm || undefined,
      },
      { signal: controller.signal },
    )
      .then(({ items, page }) => {
        if (controller.signal.aborted) return;

        setMoviePage({ items: items.map(toMovieCard), page });
        if (page.hasMore && page.nextCursor) {
          cursorCache.current.byPage.set(currentPage + 1, page.nextCursor);
        } else {
          setLastPage(currentPage);
        }
        setIsLoading(false);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        setError(requestError.message || "영화 목록을 불러오지 못했습니다.");
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [searchTerm, currentPage, retryCount]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMovies(
      { limit: 3, sortBy: "amount", order: "desc" },
      { signal: controller.signal },
    )
      .then(({ items }) => {
        if (!controller.signal.aborted) setTopMovies(items.map(toMovieCard));
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setTopError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsTopLoading(false);
      });

    return () => controller.abort();
  }, []);

  function openMovie(movie) {
    navigate(`/detail/${movie.movieId}`, { state: { movie } });
  }

  async function changePage(page) {
    if (page < 1 || (lastPage !== null && page > lastPage)) return;

    const requestId = ++navigationId.current;
    const query = searchTerm;
    setIsResolvingPage(true);

    try {
      for (let pageToResolve = 2; pageToResolve <= page; pageToResolve += 1) {
        if (requestId !== navigationId.current || cursorCache.current.query !== query) return;
        if (cursorCache.current.byPage.has(pageToResolve)) continue;

        const previousCursor = cursorCache.current.byPage.get(pageToResolve - 1);
        if (!previousCursor) return;

        const result = await fetchMovies({
          limit: MOVIES_PER_PAGE,
          cursor: previousCursor,
          q: query || undefined,
        });

        if (requestId !== navigationId.current || cursorCache.current.query !== query) return;
        if (!result.page.hasMore || !result.page.nextCursor) {
          setLastPage(pageToResolve - 1);
          return;
        }

        cursorCache.current.byPage.set(pageToResolve, result.page.nextCursor);
      }

      setPagination({ query, page });
      document.getElementById("all-movies-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (requestError) {
      if (requestId === navigationId.current) {
        setError(requestError.message || "페이지를 불러오지 못했습니다.");
      }
    } finally {
      if (requestId === navigationId.current) setIsResolvingPage(false);
    }
  }

  const visibleMovies = moviePage.items;
  const pageGroupStart = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const pageGroupEnd = Math.min(pageGroupStart + 9, lastPage ?? pageGroupStart + 9);
  const pageNumbers = Array.from(
    { length: pageGroupEnd - pageGroupStart + 1 },
    (_, index) => pageGroupStart + index,
  );
  const hasPreviousPage = currentPage > 1;
  const hasPreviousGroup = pageGroupStart > 1;
  const hasNextGroup = lastPage === null || lastPage > pageGroupEnd;

  return (
    <div className="pb-24 font-cinefund text-[#161a22] max-[620px]:pb-14 motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:animate-none motion-reduce:[&_*]:transition-none">
      <section className="mb-[92px] max-[1023px]:mb-16 max-[620px]:mb-11" aria-labelledby="discovery-title">
        <PageHeading
          id="discovery-title"
          eyebrow="DISCOVER FILMS"
          title="영화 탐색"
          description="다음으로 응원하고 싶은 영화를 찾아보세요."
        />
      </section>

      {!searchTerm && (
        <section className="mb-[68px] min-w-0 max-[620px]:mb-10" aria-labelledby="top-funding-title">
          <div className="mb-6 flex items-end justify-between gap-5 max-[620px]:mb-4">
            <h2 id="top-funding-title" className="m-0 text-[32px] font-bold leading-[1.25] tracking-[-0.045em] text-[#161a22] max-[1023px]:text-[27px] max-[620px]:text-[22px]">펀딩순위 Top 3</h2>
          </div>
          <div aria-busy={isTopLoading}>
            <ScrollRail label="펀딩순위 Top 3">
              {isTopLoading
                ? Array.from({ length: 3 }, (_, index) => <RankedMovieCardSkeleton key={index} />)
                : topMovies.map((movie) => (
                  <RankedMovieCard key={movie.id} movie={movie} onOpen={openMovie} />
                ))}
            </ScrollRail>
            {isTopLoading && <p className="sr-only" role="status">펀딩 순위를 불러오는 중입니다.</p>}
          </div>
          {!isTopLoading && topError && <p className="text-sm text-[#697180]" role="status">펀딩 순위를 불러오지 못했습니다.</p>}
        </section>
      )}

      <section className="min-w-0" aria-labelledby="all-movies-title">
        <div className="mb-6 flex items-end justify-between gap-5 border-t border-[#dde1e8] pt-[34px] max-[620px]:mb-4 max-[620px]:pt-6">
          <div>
            <h2 id="all-movies-title" className="m-0 text-[32px] font-bold leading-[1.25] tracking-[-0.045em] text-[#161a22] max-[1023px]:text-[27px] max-[620px]:text-[22px]">{searchTerm ? "검색 결과" : "전체 영화"}</h2>
          </div>
          <span className="pb-[5px] text-[13px] text-[#697180]">{isLoading ? "불러오는 중" : `${visibleMovies.length}편 표시`}</span>
        </div>

        <div className="grid grid-cols-5 gap-x-5 gap-y-6 max-[1023px]:grid-cols-3 max-[1023px]:gap-x-4 max-[1023px]:gap-y-5 max-[620px]:grid-cols-2 max-[620px]:gap-x-[10px] max-[620px]:gap-y-[14px]" aria-live="polite" aria-busy={isLoading}>
          {visibleMovies.map((movie) => <MovieCard key={movie.movieId} movie={movie} onOpen={openMovie} />)}
          {isLoading && Array.from({ length: MOVIES_PER_PAGE }, (_, index) => <MovieCardSkeleton key={`skeleton-${index}`} />)}
        </div>

        {isLoading && <p className="sr-only" role="status">영화 목록을 불러오는 중입니다.</p>}
        {!isLoading && error && (
          <div className="py-8 text-center" role="alert">
            <p className="text-[#697180]">{error}</p>
            <button type="button" className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" onClick={() => setRetryCount((count) => count + 1)}>다시 시도</button>
          </div>
        )}
        {!isLoading && !error && visibleMovies.length === 0 && (
          <p className="py-8 text-center text-[#697180]">{searchTerm ? "검색 결과가 없습니다. 다른 영화 제목을 입력해 주세요." : "표시할 영화가 없습니다."}</p>
        )}

        {!isLoading && !error && visibleMovies.length > 0 && (hasPreviousPage || hasPreviousGroup || hasNextGroup || pageNumbers.length > 1) && (
          <nav className="mt-9 flex items-center justify-center gap-[18px] max-[620px]:mt-6 max-[620px]:gap-2" aria-label="영화 목록 페이지">
            <button
              type="button"
              className="inline-flex min-w-10 h-10 cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#e2e5e9] bg-white text-[13px] text-[#414957] transition-[border-color,background-color,color] duration-[160ms] enabled:hover:border-primary enabled:hover:text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgb(3_112_105/30%)] disabled:cursor-not-allowed disabled:text-[#b8bdc5] max-[620px]:min-w-[34px] max-[620px]:h-9 max-[620px]:rounded-[7px] max-[620px]:px-[7px] max-[620px]:text-[11px]"
              onClick={() => changePage(hasPreviousGroup ? pageGroupStart - 10 : currentPage - 1)}
              disabled={isResolvingPage || (!hasPreviousPage && !hasPreviousGroup)}
              aria-label={hasPreviousGroup ? "이전 페이지 묶음" : "이전 페이지"}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <div className="flex items-center gap-1 max-[620px]:gap-[3px]">
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  className="inline-flex min-w-10 h-10 cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#e2e5e9] bg-white text-[13px] text-[#414957] transition-[border-color,background-color,color] duration-[160ms] enabled:hover:border-primary enabled:hover:text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgb(3_112_105/30%)] disabled:cursor-not-allowed disabled:opacity-60 max-[620px]:min-w-[34px] max-[620px]:h-9 max-[620px]:rounded-[7px] max-[620px]:text-[11px]"
                  onClick={() => changePage(page)}
                  disabled={isResolvingPage || currentPage === page}
                  style={currentPage === page ? { borderColor: "#037069", backgroundColor: "#037069", color: "#fff" } : undefined}
                  aria-current={currentPage === page ? "page" : undefined}
                  aria-label={`${page}페이지`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex min-w-10 h-10 cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#e2e5e9] bg-white text-[13px] text-[#414957] transition-[border-color,background-color,color] duration-[160ms] enabled:hover:border-primary enabled:hover:text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgb(3_112_105/30%)] disabled:cursor-not-allowed disabled:text-[#b8bdc5] max-[620px]:min-w-[34px] max-[620px]:h-9 max-[620px]:rounded-[7px] max-[620px]:px-[7px] max-[620px]:text-[11px]"
              onClick={() => changePage(hasNextGroup ? pageGroupStart + 10 : currentPage + 1)}
              disabled={
                isResolvingPage ||
                (hasNextGroup
                  ? lastPage !== null && lastPage <= pageGroupEnd
                  : !moviePage.page.hasMore)
              }
              aria-label={hasNextGroup ? "다음 페이지 묶음" : "다음 페이지"}
            >
              <ChevronRight aria-hidden="true" />
            </button>
            {isResolvingPage && <span className="sr-only" role="status">페이지 위치를 확인하는 중입니다.</span>}
          </nav>
        )}
      </section>
    </div>
  );
}
