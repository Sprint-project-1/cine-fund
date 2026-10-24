import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AiSummaryModal from "../components/AiSummaryModal.jsx";
import { fetchComparison } from "../api/movies.js";

const EMPTY_MOVIE_IDS = [];

// 비교 항목: 라벨과 값을 꺼내는 방법
const genres = { label: "장르", getValue: (movie) => (movie.tags ?? []).join(", ") || "-" };
const director = { label: "감독", getValue: (movie) => movie.director || "-" };
const funding = { label: "펀딩 금액", getValue: (movie) => movie.fundingAmount ?? "-" };
const goal = { label: "목표 금액", getValue: (movie) => movie.fundingGoal ?? "-" };
const rate = { label: "달성률", getValue: (movie) => movie.achievementRate ?? "-" };

// 데스크톱·태블릿은 표, 모바일은 카드로 보여 준다 (시안의 항목 순서)
const tableRows = [genres, director, funding, rate];
const cardRows = [genres, funding, goal, rate];

export default function CompareResultPage() {
  const { state } = useLocation();
  const movieIds = state?.movieIds ?? EMPTY_MOVIE_IDS;
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(movieIds.length >= 2);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [copied, setCopied] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (movieIds.length < 2 || movieIds.length > 5) return undefined;
    const controller = new AbortController();
    fetchComparison(movieIds, { signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) setMovies(items);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message || "비교 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [movieIds, retry]);

  const displayMovies = movies.map((movie) => ({
    ...movie,
    id: movie.movieId,
    tags: movie.genres ?? [],
    fundingAmount: movie.totalFundedAmount ?? "0",
    fundingGoal: movie.productionBudget,
    achievementRate: getAchievementRate(movie.totalFundedAmount, movie.productionBudget),
  }));

  // 새로고침 등으로 선택 정보가 없거나 2개 미만이면 안내
  if (movieIds.length < 2 || movieIds.length > 5) {
    return (
      <section className="mx-auto max-w-[640px] pt-16 text-center">
        <p className="text-[#697180]">비교할 영화를 먼저 선택해 주세요.</p>
        <Link to="/compare" className="mt-4 inline-block font-bold text-[#037069]">
          영화 선택하러 가기
        </Link>
      </section>
    );
  }

  if (isLoading) return <p className="py-16 text-center text-[#697180]" role="status">비교 정보를 불러오는 중입니다.</p>;
  if (error) return <div className="py-16 text-center" role="alert"><p className="text-[#697180]">{error}</p><button type="button" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" onClick={() => { setIsLoading(true); setError(""); setRetry((n) => n + 1); }}>다시 시도</button></div>;
  if (displayMovies.length < 2) return <p className="py-16 text-center text-[#697180]">비교 결과가 없습니다.</p>;

  const columns = { gridTemplateColumns: `120px repeat(${displayMovies.length}, 1fr)` };

  async function copyResult() {
    const text = displayMovies.map((movie) => movie.title).join(" vs ");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="pt-6 pb-12 text-[#141c2b]">
      <div className="mb-8 flex flex-col gap-5 min-[911px]:flex-row min-[911px]:items-end min-[911px]:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold tracking-wide text-primary">RESULTS</p>
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.04em] min-[621px]:text-4xl min-[911px]:text-5xl">
            비교 결과
          </h1>
          <p className="mt-3 text-base text-[#697180]">
            <span className="max-[620px]:hidden">선택한 영화의 정보와 펀딩 지표를 나란히 확인하세요.</span>
            <span className="hidden max-[620px]:inline">선택한 영화의 펀딩 지표를 확인하세요.</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="h-[46px] shrink-0 self-end rounded-xl border border-[#e0e5ed] bg-white px-6 text-sm text-[#141c2b] transition-colors hover:bg-[#f5f7fa] max-[620px]:w-full"
        >
          AI로 요약하기
        </button>
      </div>

      {/* 데스크톱·태블릿: 표 (모바일에서는 숨김) */}
      <div className="rounded-3xl bg-white p-6 max-[620px]:hidden">
        <div className="grid gap-4" style={columns}>
          <div />
          {displayMovies.map((movie) => (
            <div key={movie.id} className="rounded-2xl bg-[#f1f2f6] p-4 min-[621px]:max-[910px]:text-center">
              {movie.posterPath ? <img src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`} alt={`${movie.title} 포스터`} className="aspect-[2/3] w-full rounded-xl bg-[#f1f2f6] object-cover" /> : <div className="aspect-[2/3] rounded-xl bg-[#5d4a6b]" />}
              <h2 className="mt-4 text-lg font-bold">{movie.title}</h2>
              {/* 감독은 태블릿에서만 카드에 보인다 */}
              <p className="mt-1 hidden text-xs text-[#697180] min-[621px]:max-[910px]:block">
                감독 · {movie.director || "-"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {tableRows.map((row, index) => (
            <div
              key={row.label}
              className={`grid gap-4 rounded-xl py-5 ${index % 2 === 0 ? "bg-[#f5f6f8]" : ""}`}
              style={columns}
            >
              <div className="px-4 text-sm text-[#697180]">{row.label}</div>
              {displayMovies.map((movie) => (
                <div
                  key={movie.id}
                  className={`px-4 text-sm min-[621px]:max-[910px]:text-center ${row === rate ? "font-bold text-[#4d7c0f]" : ""}`}
                >
                  {row.getValue(movie)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 모바일: 좌우로 넘기는 영화 카드 (데스크톱·태블릿에서는 숨김) */}
      <div className="hidden max-[620px]:block">
        <h2 className="mb-4 text-xl font-bold">비교 영화</h2>
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
          {displayMovies.map((movie) => (
            <li
              key={movie.id}
              className="w-[72%] min-w-[240px] shrink-0 snap-start rounded-2xl border border-[#e0e5ed] bg-white p-4"
            >
              <div className="flex gap-4">
                {movie.posterPath ? <img src={`https://image.tmdb.org/t/p/w185${movie.posterPath}`} alt={`${movie.title} 포스터`} className="aspect-[2/3] w-[72px] shrink-0 rounded-xl object-cover" /> : <div className="aspect-[2/3] w-[72px] shrink-0 rounded-xl bg-[#5d4a6b]" />}
                <div>
                  <h3 className="text-lg font-bold">{movie.title}</h3>
                  <p className="mt-2 text-sm text-[#697180]">감독 · {movie.director || "-"}</p>
                </div>
              </div>

              <div className="mt-4">
                {cardRows.map((row) => (
                  <div key={row.label} className="border-t border-[#e0e5ed] py-3">
                    <p className="text-xs text-[#697180]">{row.label}</p>
                    <p className={`mt-1 text-lg font-bold ${row === rate ? "text-primary" : ""}`}>
                      {row.getValue(movie)}
                    </p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-[#697180]">← 좌우로 밀어 영화를 비교하세요 →</p>
      </div>

      <div className="mt-8 flex justify-end gap-3 max-[620px]:flex-col">
        <button
          type="button"
          onClick={() => navigate("/compare")}
          className="h-[46px] rounded-xl border border-[#e0e5ed] bg-white px-6 text-sm"
        >
          비교 영화 수정
        </button>
        <button
          type="button"
          onClick={copyResult}
          className="h-[46px] rounded-xl bg-primary px-6 text-sm font-bold text-white"
        >
          {copied ? "복사됨" : "비교 결과 복사"}
        </button>
      </div>

      {aiOpen && <AiSummaryModal onClose={() => setAiOpen(false)} />}
    </section>
  );
}

function getAchievementRate(totalFundedAmount, productionBudget) {
  if (totalFundedAmount == null || productionBudget == null) return "-";
  try {
    const goal = BigInt(productionBudget);
    if (goal <= 0n) return "-";
    const tenths = (BigInt(totalFundedAmount) * 1000n) / goal;
    return `${tenths / 10n}.${tenths % 10n}%`;
  } catch {
    return "-";
  }
}
