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
      className={`movie-poster ${featured ? "movie-poster--featured" : ""}`}
      style={{ "--poster-color": movie.posterColor, "--poster-accent": movie.posterAccent }}
      role="img"
      aria-label={`${movie.title} 포스터 자리`}
    >
      <span>포스터</span>
    </div>
  );
}

function FundingProgress({ movie, featured = false }) {
  const achievement = getAchievement(movie);

  return (
    <div className={`funding-progress ${featured ? "funding-progress--featured" : ""}`}>
      <div
        className="funding-progress__track"
        role="progressbar"
        aria-label={`${movie.title} 펀딩 달성률`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.min(achievement, 100)}
      >
        <span style={{ width: `${Math.min(achievement, 100)}%` }} />
      </div>
      <p className="funding-progress__summary">
        <span>{formatAmount(movie.raisedAmount)}</span>
        <span>{achievement}% 달성</span>
      </p>
    </div>
  );
}

function MovieCard({ movie, onOpen }) {
  return (
    <button type="button" className="movie-card" onClick={() => onOpen(movie)}>
      <Poster movie={movie} />
      <span className="movie-card__title">{movie.title}</span>
      <span className="movie-card__meta">{movie.genres.join(" · ")} · {movie.year}</span>
      <FundingProgress movie={movie} />
    </button>
  );
}

function RankedMovieCard({ movie, onOpen }) {
  return (
    <button type="button" className="ranked-movie-card" onClick={() => onOpen(movie)}>
      <Poster movie={movie} featured />
      <span className="ranked-movie-card__title">{movie.title}</span>
      <span className="ranked-movie-card__meta">{movie.genres.join(" · ")} · {movie.year}</span>
      <FundingProgress movie={movie} featured />
    </button>
  );
}

function ScrollRail({ children, label }) {
  return (
    <div className="scroll-rail-wrap">
      <div className="scroll-rail" aria-label={label}>
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
    <div className="movie-exploration">
      <section className="discovery-intro" aria-labelledby="discovery-title">
        <p className="discovery-intro__eyebrow">DISCOVER FILMS</p>
        <h1 id="discovery-title">영화 탐색</h1>
        <p className="discovery-intro__description">다음으로 응원하고 싶은 영화를 찾아보세요.</p>
      </section>

      {!searchTerm && (
        <section className="discovery-section top-funding-section" aria-labelledby="top-funding-title">
          <div className="section-heading">
            <h2 id="top-funding-title">펀딩순위 Top 3</h2>
          </div>
          <ScrollRail label="펀딩순위 Top 3">
            {topMovies.map((movie) => (
              <RankedMovieCard key={movie.id} movie={movie} onOpen={openMovie} />
            ))}
          </ScrollRail>
        </section>
      )}

      <section className="discovery-section all-movies-section" aria-labelledby="all-movies-title">
        <div className="section-heading section-heading--all-movies">
          <div>
            <h2 id="all-movies-title">{searchTerm ? "검색 결과" : "전체 영화"}</h2>
          </div>
          <span className="movie-count">{filteredMovies.length}편</span>
        </div>

        <div className="movie-grid" aria-live="polite">
          {visibleMovies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpen={openMovie} />)}
        </div>

        {filteredMovies.length === 0 ? (
          <p className="empty-movies-state">검색 결과가 없습니다. 다른 영화 제목이나 장르로 검색해 주세요.</p>
        ) : (
          <nav className="pagination" aria-label="영화 목록 페이지">
            <button
              type="button"
              className="pagination__arrow"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <div className="pagination__pages">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`pagination__page ${currentPage === page ? "is-active" : ""}`}
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
              className="pagination__arrow"
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
