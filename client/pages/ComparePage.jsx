import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import PageHeading from "../components/PageHeading.jsx";
import { fetchMovies } from "../api/movies.js";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const PAGE_SIZE = 10;

function Poster({ posterPath, title, compact = false }) {
  const dimensions = compact ? "h-[84px] w-[56px]" : "h-[87px] w-[58px]";

  if (posterPath) {
    return (
      <img
        src={`https://image.tmdb.org/t/p/w185${posterPath}`}
        alt={`${title} 포스터`}
        loading="lazy"
        className={`${dimensions} shrink-0 rounded-lg border border-[#e0e5ed] bg-[#f5f7fa] object-cover`}
      />
    );
  }

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-lg border border-[#e0e5ed] bg-[#f5f7fa] px-1 text-center text-[9px] text-[#66738a]`}
      role="img"
      aria-label={`${title} 포스터 없음`}
    >
      포스터 없음
    </div>
  );
}

function getApiErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function ComparePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [movieCache, setMovieCache] = useState(() => new Map());
  const [selectedIds, setSelectedIds] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [listError, setListError] = useState("");
  const [compareError, setCompareError] = useState("");
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await fetchMovies(
          { limit: PAGE_SIZE, ...(query.trim() ? { q: query.trim() } : {}) },
          { signal: controller.signal },
        );
        if (requestId.current !== currentRequestId) return;
        setMovies(result.items);
        setMovieCache((current) => {
          const next = new Map(current);
          result.items.forEach((movie) => next.set(movie.movieId, movie));
          return next;
        });
        setNextCursor(result.page.nextCursor);
        setHasMore(result.page.hasMore);
      } catch (error) {
        if (controller.signal.aborted || requestId.current !== currentRequestId) return;
        setListError(getApiErrorMessage(error, "영화 목록을 불러오지 못했습니다."));
      } finally {
        if (requestId.current === currentRequestId) setIsLoading(false);
      }
    }, query.trim() ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, retryCount]);

  const selectedMovies = useMemo(
    () => selectedIds.map((id) => movieCache.get(id)).filter(Boolean),
    [movieCache, selectedIds],
  );

  function toggleMovie(movieId) {
    setSelectedIds((current) => {
      if (current.includes(movieId)) return current.filter((id) => id !== movieId);
      if (current.length >= 5) return current;
      return [...current, movieId];
    });
    setCompareError("");
  }

  function updateQuery(value) {
    setQuery(value);
    setMovies([]);
    setNextCursor(null);
    setHasMore(false);
    setIsLoading(true);
    setIsLoadingMore(false);
    loadingMoreRef.current = false;
    setListError("");
  }

  function retryList() {
    setIsLoading(true);
    setListError("");
    setRetryCount((current) => current + 1);
  }

  async function loadMore() {
    if (!nextCursor || !hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setListError("");
    const currentRequestId = requestId.current;
    try {
      const result = await fetchMovies(
        { limit: PAGE_SIZE, cursor: nextCursor, ...(query.trim() ? { q: query.trim() } : {}) },
      );
      if (requestId.current !== currentRequestId) return;
      setMovies((current) => [...current, ...result.items]);
      setMovieCache((current) => {
        const next = new Map(current);
        result.items.forEach((movie) => next.set(movie.movieId, movie));
        return next;
      });
      setNextCursor(result.page.nextCursor);
      setHasMore(result.page.hasMore);
    } catch (error) {
      if (requestId.current === currentRequestId) {
        setListError(getApiErrorMessage(error, "영화를 더 불러오지 못했습니다."));
      }
    } finally {
      loadingMoreRef.current = false;
      if (requestId.current === currentRequestId) setIsLoadingMore(false);
    }
  }

  async function compareMovies() {
    if (selectedIds.length < 2 || selectedIds.length > 5 || isComparing) return;
    setIsComparing(true);
    setCompareError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/comparisons`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieIds: selectedIds }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message || "영화 비교를 불러오지 못했습니다.");
      }
      if (!Array.isArray(body?.items) || body.items.length !== selectedIds.length) {
        throw new Error("영화 비교 응답 형식이 올바르지 않습니다.");
      }

      navigate("/compare-result", {
        state: {
          movies: body.items.map((movie) => ({
            ...movie,
            id: movie.movieId,
            tags: movie.genres ?? [],
            fundingAmount: movie.totalFundedAmount ?? "0",
            fundingGoal: movie.productionBudget,
            achievementRate: getAchievementRate(
              movie.totalFundedAmount,
              movie.productionBudget,
            ),
          })),
        },
      });
    } catch (error) {
      setCompareError(getApiErrorMessage(error, "영화 비교를 불러오지 못했습니다."));
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <section className="w-full pb-12 text-[#141c2b]" aria-labelledby="compare-title">
      <div className="mb-[30px] flex flex-wrap items-end justify-between gap-5">
        <PageHeading
          id="compare-title"
          eyebrow="COMPARE"
          title="영화 비교"
          description="비교할 영화를 2개 이상, 최대 5개까지 선택하세요."
        />
        <div className="flex flex-col items-end gap-2">
          {compareError && <p className="text-right text-xs text-[#b42318]" role="alert">{compareError}</p>}
          <button
            type="button"
            onClick={compareMovies}
            disabled={selectedIds.length < 2 || isComparing}
            className="h-[42px] w-[152px] shrink-0 rounded-xl bg-[#037069] text-sm font-bold text-white transition-colors hover:bg-[#025f59] disabled:cursor-not-allowed disabled:bg-[#a8bfbd]"
          >
            {isComparing ? "비교 중…" : "영화 비교하기"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 min-[621px]:grid-cols-2 min-[911px]:gap-[26px]">
        <section className="rounded-2xl border border-[#e0e5ed] bg-white p-4 min-[621px]:min-h-[765px] min-[621px]:p-[23px]" aria-labelledby="movie-search-heading">
          <h2 id="movie-search-heading" className="text-xl font-bold">영화 검색</h2>
          <label className="mt-3 flex h-12 items-center gap-3 rounded-xl border border-[#e0e5ed] px-3 text-[#66738a] focus-within:border-[#037069] focus-within:ring-2 focus-within:ring-[#037069]/10">
            <Search aria-hidden="true" className="size-5 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="영화 제목 검색"
              aria-label="영화 제목 검색"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#141c2b] outline-none placeholder:text-[#66738a]"
            />
          </label>

          <div className="mt-5 flex items-center justify-between border-b border-[#e0e5ed] pb-3">
            <h3 className="text-sm font-bold">검색 결과</h3>
            <span className="text-xs text-[#66738a]">{isLoading ? "불러오는 중" : `${movies.length}개`}</span>
          </div>

          <ul className="mt-4 space-y-4" aria-busy={isLoading || isLoadingMore}>
            {movies.map((movie) => {
              const isSelected = selectedIds.includes(movie.movieId);
              const isAtLimit = !isSelected && selectedIds.length >= 5;
              return (
                <li key={movie.movieId} className="flex min-h-[96px] items-center gap-3 px-3 py-1.5 min-[621px]:gap-4 min-[621px]:pr-5">
                  <Poster compact posterPath={movie.posterPath} title={movie.title} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="truncate text-sm font-bold">{movie.title}</h4>
                      {(movie.genres ?? []).slice(0, 2).map((genre) => (
                        <span key={genre} className="rounded-full bg-[#e5f2f1] px-1.5 py-0.5 text-[9px] font-bold text-[#037069]">{genre}</span>
                      ))}
                    </div>
                    <p className="mt-2 truncate text-xs text-[#66738a]">감독 · {movie.director || "정보 없음"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMovie(movie.movieId)}
                    disabled={isAtLimit}
                    aria-pressed={isSelected}
                    className={`h-9 w-[76px] shrink-0 rounded-[10px] text-xs font-bold transition-colors min-[621px]:w-[92px] ${
                      isSelected
                        ? "border border-[#e0e5ed] bg-[#f5f7fa] text-[#66738a] hover:bg-[#edf0f4]"
                        : "bg-[#037069] text-white hover:bg-[#025f59] disabled:cursor-not-allowed disabled:bg-[#9ab8b5]"
                    }`}
                  >
                    {isSelected ? "추가됨" : "추가"}
                  </button>
                </li>
              );
            })}
            {isLoading && <li className="py-12 text-center text-sm text-[#66738a]">영화 목록을 불러오는 중입니다…</li>}
            {!isLoading && !listError && movies.length === 0 && (
              <li className="py-12 text-center text-sm text-[#66738a]">검색 결과가 없습니다.</li>
            )}
            {listError && (
              <li className="py-8 text-center text-sm text-[#b42318]" role="alert">
                <p>{listError}</p>
                <button type="button" onClick={retryList} className="mt-3 font-bold underline">다시 불러오기</button>
              </li>
            )}
          </ul>
          {!isLoading && hasMore && !listError && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="mt-5 h-10 w-full rounded-xl border border-[#e0e5ed] text-sm font-bold text-[#344054] transition-colors hover:bg-[#f5f7fa] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? "불러오는 중…" : "영화 더 보기"}
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-[#e0e5ed] bg-white p-4 min-[621px]:min-h-[765px] min-[621px]:p-[23px]" aria-labelledby="selected-movies-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="selected-movies-heading" className="text-xl font-bold">선택한 영화</h2>
            <span className="text-[13px] font-bold text-[#037069]">{selectedIds.length} / 5편</span>
          </div>
          <p className="mt-2 text-xs text-[#66738a]">비교할 영화를 선택하세요.</p>
          <div className="mt-4 border-t border-[#e0e5ed] pt-[22px]">
            <ul className="space-y-[18px]">
              {selectedMovies.map((movie) => (
                <li key={movie.movieId} className="flex min-h-20 items-center gap-3 rounded-xl border border-[#e0e5ed] p-2.5 min-[621px]:gap-4 min-[621px]:p-3">
                  <Poster posterPath={movie.posterPath} title={movie.title} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold">{movie.title}</h3>
                    <p className="mt-2 truncate text-xs text-[#66738a]">감독 · {movie.director || "정보 없음"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMovie(movie.movieId)}
                    className="h-[34px] w-[70px] shrink-0 rounded-[10px] border border-[#e0e5ed] bg-[#f5f7fa] text-xs text-[#141c2b] transition-colors hover:bg-[#edf0f4] min-[621px]:w-[88px]"
                    aria-label={`${movie.title} 제거`}
                  >
                    제거
                  </button>
                </li>
              ))}
              {Array.from({ length: 5 - selectedMovies.length }, (_, index) => (
                <li
                  key={`empty-${index}`}
                  className={`flex min-h-20 items-center justify-center rounded-xl border border-[#e0e5ed] px-4 text-center text-xs text-[#66738a] ${index === 0 ? "bg-[#e0e5ed]" : "bg-white"}`}
                >
                  영화를 추가할 수 있어요.
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}

function getAchievementRate(totalFundedAmount, productionBudget) {
  if (!totalFundedAmount || !productionBudget) return "-";
  try {
    const funded = BigInt(totalFundedAmount);
    const goal = BigInt(productionBudget);
    if (goal <= 0n) return "-";
    const tenthsOfPercent = (funded * 1000n) / goal;
    return `${tenthsOfPercent / 10n}.${tenthsOfPercent % 10n}%`;
  } catch {
    return "-";
  }
}