import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MOVIES_PER_PAGE = 10;

// 화면 작업을 위한 예시 데이터입니다. API 계약이 준비되면 서버 데이터로 교체합니다.
const MOVIES = [
  { id: 1, title: "듄: 파트 2", year: 2024, genres: ["SF", "모험"], raisedAmount: 248000000, targetAmount: 300000000, posterColor: "#38525a", posterAccent: "#775543" },
  { id: 2, title: "웡카", year: 2024, genres: ["판타지", "모험"], raisedAmount: 196000000, targetAmount: 280000000, posterColor: "#805943", posterAccent: "#315660" },
  { id: 3, title: "파묘", year: 2024, genres: ["미스터리", "공포"], raisedAmount: 175000000, targetAmount: 250000000, posterColor: "#444961", posterAccent: "#745642" },
  { id: 4, title: "인사이드 아웃 2", year: 2024, genres: ["애니메이션", "가족"], raisedAmount: 162000000, targetAmount: 260000000, posterColor: "#665171", posterAccent: "#424965" },
  { id: 5, title: "서울의 봄", year: 2023, genres: ["드라마", "역사"], raisedAmount: 151000000, targetAmount: 240000000, posterColor: "#655071", posterAccent: "#414862" },
  { id: 6, title: "오펜하이머", year: 2023, genres: ["드라마", "역사"], raisedAmount: 143000000, targetAmount: 270000000, posterColor: "#395660", posterAccent: "#665172" },
  { id: 7, title: "엘리멘탈", year: 2023, genres: ["애니메이션", "로맨스"], raisedAmount: 138000000, targetAmount: 220000000, posterColor: "#805943", posterAccent: "#395660" },
  { id: 8, title: "스즈메의 문단속", year: 2023, genres: ["애니메이션", "판타지"], raisedAmount: 124000000, targetAmount: 240000000, posterColor: "#444961", posterAccent: "#805943" },
  { id: 9, title: "범죄도시 4", year: 2024, genres: ["액션", "범죄"], raisedAmount: 112000000, targetAmount: 250000000, posterColor: "#665171", posterAccent: "#38525a" },
  { id: 10, title: "극한직업", year: 2019, genres: ["코미디", "액션"], raisedAmount: 98000000, targetAmount: 190000000, posterColor: "#665171", posterAccent: "#444961" },
  { id: 11, title: "기생충", year: 2019, genres: ["드라마", "스릴러"], raisedAmount: 93000000, targetAmount: 210000000, posterColor: "#395660", posterAccent: "#665171" },
  { id: 12, title: "인터스텔라", year: 2014, genres: ["SF", "드라마"], raisedAmount: 89000000, targetAmount: 230000000, posterColor: "#805943", posterAccent: "#395660" },
  { id: 13, title: "라라랜드", year: 2016, genres: ["로맨스", "드라마"], raisedAmount: 81000000, targetAmount: 180000000, posterColor: "#444961", posterAccent: "#665171" },
  { id: 14, title: "아바타: 물의 길", year: 2022, genres: ["SF", "모험"], raisedAmount: 76000000, targetAmount: 290000000, posterColor: "#395660", posterAccent: "#444961" },
  { id: 15, title: "헤어질 결심", year: 2022, genres: ["미스터리", "로맨스"], raisedAmount: 69000000, targetAmount: 170000000, posterColor: "#805943", posterAccent: "#665171" },
];

function formatAmount(amount) {
  return `₩ ${new Intl.NumberFormat("ko-KR").format(amount)}`;
}

function getAchievement(movie) {
  if (!movie.targetAmount) return 0;
  return Math.round((movie.raisedAmount / movie.targetAmount) * 100);
}

function Poster({ movie, featured = false }) {
  return (
    <div
      className={`relative flex aspect-[0.76/1] flex-none items-end overflow-hidden rounded-lg text-white/80 ${featured ? "w-full" : ""}`}
      style={{
        backgroundImage: `linear-gradient(180deg, ${movie.posterColor} 0 52%, ${movie.posterAccent} 52% 100%)`,
      }}
      role="img"
      aria-label={`${movie.title} 포스터 자리`}
    >
      <span className="absolute inset-x-0 top-[42%] bottom-0 bg-gradient-to-b from-transparent to-[rgb(13_18_28/42%)]" />
      <span className="relative z-10 pb-[14px] pl-[14px] text-[11px] tracking-[0.04em]">포스터</span>
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
        aria-valuenow={Math.min(achievement, 100)}
      >
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${Math.min(achievement, 100)}%` }}
        />
      </div>
      <p className={`mt-[9px] mb-0 flex justify-between gap-2 leading-[1.4] text-[#697180] ${featured ? "text-xs" : compact ? "mt-[7px] text-[10px] max-[620px]:text-[9px]" : "text-[11px]"}`}>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#414957]">{formatAmount(movie.raisedAmount)}</span>
        <span>{achievement}% 달성</span>
      </p>
    </div>
  );
}

function MovieCard({ movie, onOpen }) {
  return (
    <button
      type="button"
      className="flex min-w-0 flex-col rounded-[10px] border border-[#e8eaee] bg-white p-3 text-left transition-[transform,box-shadow] duration-[160ms] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgb(22_26_34/9%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[rgb(3_112_105/35%)] max-[620px]:rounded-lg max-[620px]:p-2"
      onClick={() => onOpen(movie)}
    >
      <Poster movie={movie} />
      <span className="mt-3 block overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold text-[#161a22] max-[620px]:mt-[9px] max-[620px]:text-[13px]">{movie.title}</span>
      <span className="mt-[5px] block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#697180] max-[620px]:text-[10px]">{movie.genres.join(" · ")} · {movie.year}</span>
      <FundingProgress movie={movie} compact />
    </button>
  );
}

function RankedMovieCard({ movie, onOpen }) {
  return (
    <button
      type="button"
      className="relative flex min-w-0 snap-start flex-col items-stretch rounded-xl border border-[#e8eaee] bg-white p-[14px] text-left transition-[transform,box-shadow] duration-[160ms] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgb(22_26_34/9%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[rgb(3_112_105/35%)] max-[620px]:rounded-[10px] max-[620px]:p-[10px]"
      onClick={() => onOpen(movie)}
    >
      <Poster movie={movie} featured />
      <span className="mt-[18px] block overflow-hidden text-ellipsis whitespace-nowrap text-[19px] font-bold text-[#161a22] max-[620px]:mt-3 max-[620px]:text-base">{movie.title}</span>
      <span className="mt-[7px] block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#697180] max-[620px]:text-[11px]">{movie.genres.join(" · ")} · {movie.year}</span>
      <FundingProgress movie={movie} featured />
    </button>
  );
}

function ScrollRail({ children, label }) {
  return (
    <div className="relative">
      <div
        className="grid auto-cols-[minmax(0,1fr)] grid-flow-col gap-6 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory px-[2px] pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[1023px]:auto-cols-[minmax(260px,44%)] max-[1023px]:gap-[18px] max-[620px]:auto-cols-[minmax(72%,1fr)] max-[620px]:gap-3 max-[620px]:mr-[-16px] max-[620px]:pr-4 motion-reduce:scroll-auto"
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
  const searchTerm = (searchParams.get("q") ?? "").trim().toLocaleLowerCase();
  const [pagination, setPagination] = useState({ searchTerm, page: 1 });
  const currentPage = pagination.searchTerm === searchTerm ? pagination.page : 1;
  const filteredMovies = useMemo(() => {
    if (!searchTerm) return MOVIES;
    return MOVIES.filter((movie) =>
      `${movie.title} ${movie.year} ${movie.genres.join(" ")}`.toLocaleLowerCase().includes(searchTerm),
    );
  }, [searchTerm]);
  const pageCount = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  const visibleMovies = useMemo(
    () => filteredMovies.slice((currentPage - 1) * MOVIES_PER_PAGE, currentPage * MOVIES_PER_PAGE),
    [currentPage, filteredMovies],
  );
  const topMovies = useMemo(
    () => [...MOVIES].sort((first, second) => second.raisedAmount - first.raisedAmount).slice(0, 3),
    [],
  );

  function openMovie(movie) {
    navigate("/detail", { state: { movie } });
  }

  function changePage(page) {
    setPagination({ searchTerm, page });
    document.getElementById("all-movies-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="pt-[42px] pb-24 font-cinefund text-[#161a22] max-[1023px]:pt-7 max-[620px]:pt-[18px] max-[620px]:pb-14 motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:animate-none motion-reduce:[&_*]:transition-none">
      <section className="mb-[92px] max-[1023px]:mb-16 max-[620px]:mb-11" aria-labelledby="discovery-title">
        <p className="mt-0 mb-[10px] text-xs font-bold tracking-[0.12em] text-primary max-[620px]:mb-[7px] max-[620px]:text-[9px]">DISCOVER FILMS</p>
        <h1 id="discovery-title" className="m-0 text-[52px] font-bold leading-[1.12] tracking-[-0.055em] text-[#161a22] max-[1023px]:text-[40px] max-[620px]:text-[32px]">영화 탐색</h1>
        <p className="mt-4 mb-0 text-[22px] leading-[1.5] text-[#697180] max-[1023px]:text-lg max-[620px]:mt-[10px] max-[620px]:text-sm">다음으로 응원하고 싶은 영화를 찾아보세요.</p>
      </section>

      {!searchTerm && (
        <section className="mb-[68px] min-w-0 max-[620px]:mb-10" aria-labelledby="top-funding-title">
          <div className="mb-6 flex items-end justify-between gap-5 max-[620px]:mb-4">
            <h2 id="top-funding-title" className="m-0 text-[32px] font-bold leading-[1.25] tracking-[-0.045em] text-[#161a22] max-[1023px]:text-[27px] max-[620px]:text-[22px]">펀딩순위 Top 3</h2>
          </div>
          <ScrollRail label="펀딩순위 Top 3">
            {topMovies.map((movie) => (
              <RankedMovieCard key={movie.id} movie={movie} onOpen={openMovie} />
            ))}
          </ScrollRail>
        </section>
      )}

      <section className="min-w-0" aria-labelledby="all-movies-title">
        <div className="mb-6 flex items-end justify-between gap-5 border-t border-[#dde1e8] pt-[34px] max-[620px]:mb-4 max-[620px]:pt-6">
          <div>
            <h2 id="all-movies-title" className="m-0 text-[32px] font-bold leading-[1.25] tracking-[-0.045em] text-[#161a22] max-[1023px]:text-[27px] max-[620px]:text-[22px]">{searchTerm ? "검색 결과" : "전체 영화"}</h2>
          </div>
          <span className="pb-[5px] text-[13px] text-[#697180]">{filteredMovies.length}편</span>
        </div>

        <div className="grid grid-cols-5 gap-x-5 gap-y-6 max-[1023px]:grid-cols-3 max-[1023px]:gap-x-4 max-[1023px]:gap-y-5 max-[620px]:grid-cols-2 max-[620px]:gap-x-[10px] max-[620px]:gap-y-[14px]" aria-live="polite">
          {visibleMovies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpen={openMovie} />)}
        </div>

        {filteredMovies.length === 0 ? (
          <p className="text-center text-[#697180]">검색 결과가 없습니다. 다른 영화 제목이나 장르로 검색해 주세요.</p>
        ) : (
          <nav className="mt-9 flex items-center justify-center gap-[18px] max-[620px]:mt-6 max-[620px]:gap-2" aria-label="영화 목록 페이지">
            <button
              type="button"
              className="inline-flex min-w-10 h-10 items-center justify-center gap-1 rounded-lg border border-[#e2e5e9] bg-white text-[13px] text-[#414957] transition-[border-color,background-color,color] duration-[160ms] enabled:hover:border-primary enabled:hover:text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgb(3_112_105/30%)] disabled:cursor-not-allowed disabled:text-[#b8bdc5] max-[620px]:min-w-[34px] max-[620px]:h-9 max-[620px]:rounded-[7px] max-[620px]:px-[7px] max-[620px]:text-[11px]"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <div className="flex items-center gap-1 max-[620px]:gap-[3px]">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`inline-flex min-w-10 h-10 items-center justify-center gap-1 rounded-lg border border-[#e2e5e9] bg-white text-[13px] text-[#414957] transition-[border-color,background-color,color] duration-[160ms] enabled:hover:border-primary enabled:hover:text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgb(3_112_105/30%)] max-[620px]:min-w-[34px] max-[620px]:h-9 max-[620px]:rounded-[7px] max-[620px]:text-[11px] ${currentPage === page ? "border-primary bg-primary text-white" : ""}`}
                  onClick={() => changePage(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                  aria-label={`${page}페이지`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex min-w-10 h-10 items-center justify-center gap-1 rounded-lg border border-[#e2e5e9] bg-white text-[13px] text-[#414957] transition-[border-color,background-color,color] duration-[160ms] enabled:hover:border-primary enabled:hover:text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgb(3_112_105/30%)] disabled:cursor-not-allowed disabled:text-[#b8bdc5] max-[620px]:min-w-[34px] max-[620px]:h-9 max-[620px]:rounded-[7px] max-[620px]:px-[7px] max-[620px]:text-[11px]"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label="다음 페이지"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
