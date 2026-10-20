import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";

const movies = [
  { id: 1, title: "제목", director: "홍길동", tags: ["드라마", "공포"] },
  { id: 2, title: "제목", director: "홍길동", tags: [] },
  { id: 3, title: "제목", director: "홍길동", tags: [] },
  { id: 4, title: "제목", director: "홍길동", tags: [] },
];

function Poster({ compact = false }) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-end rounded-lg border border-[#e0e5ed] bg-[#f5f7fa] pb-2 text-[9px] text-[#66738a] ${compact ? "h-[84px] w-[56px]" : "h-[87px] w-[58px]"}`}
      aria-label="포스터 이미지 없음"
    >
      포스터
    </div>
  );
}

export default function ComparePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([1, 2, 3, 4]);

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return movies;
    return movies.filter(({ title, director }) =>
      `${title} ${director}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const selectedMovies = movies.filter(({ id }) => selectedIds.includes(id));

  function toggleMovie(movieId) {
    setSelectedIds((current) => {
      if (current.includes(movieId)) {
        return current.filter((id) => id !== movieId);
      }
      if (current.length >= 5) return current;
      return [...current, movieId];
    });
  }

  return (
    <section className="w-full pt-6 pb-12 text-[#141c2b]">
      <div className="mb-[30px] flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-bold tracking-wide text-[#037069]">COMPARE</p>
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.04em] min-[621px]:text-4xl">영화 비교</h1>
          <p className="mt-[13px] text-[15px] text-[#697180]">비교할 영화를 2개 이상, 최대 5개까지 선택하세요.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/compare-result", { state: { movies: selectedMovies } })}
          disabled={selectedIds.length < 2}
          className="h-[42px] w-[152px] shrink-0 rounded-xl bg-[#037069] text-sm font-bold text-white transition-colors hover:bg-[#025f59] disabled:cursor-not-allowed disabled:bg-[#a8bfbd]"
        >
          영화 비교하기
        </button>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 min-[621px]:grid-cols-2 min-[911px]:gap-[26px]">
        <section className="rounded-2xl border border-[#e0e5ed] bg-white p-4 min-[621px]:p-[23px] min-[621px]:min-h-[765px]" aria-labelledby="movie-search-heading">
          <h2 id="movie-search-heading" className="text-xl font-bold">영화 검색</h2>
          <label className="mt-3 flex h-12 items-center gap-3 rounded-xl border border-[#e0e5ed] px-3 text-[#66738a] focus-within:border-[#037069] focus-within:ring-2 focus-within:ring-[#037069]/10">
            <Search aria-hidden="true" className="size-5 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="영화 제목 검색"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#141c2b] outline-none placeholder:text-[#66738a]"
            />
          </label>

          <div className="mt-5 flex items-center justify-between border-b border-[#e0e5ed] pb-3">
            <h3 className="text-sm font-bold">검색 결과</h3>
            <span className="text-xs text-[#66738a]">{filteredMovies.length}개</span>
          </div>

          <ul className="mt-4 space-y-4">
            {filteredMovies.map((movie) => {
              const isSelected = selectedIds.includes(movie.id);
              const isAtLimit = !isSelected && selectedIds.length >= 5;
              return (
                <li key={movie.id} className="flex min-h-[96px] items-center gap-3 px-3 py-1.5 min-[621px]:gap-4 min-[621px]:pr-5">
                  <Poster compact />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="truncate text-sm font-bold">{movie.title}</h4>
                      {movie.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#e5f2f1] px-1.5 py-0.5 text-[9px] font-bold text-[#037069]">{tag}</span>
                      ))}
                    </div>
                    <p className="mt-2 truncate text-xs text-[#66738a]">감독 · {movie.director}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMovie(movie.id)}
                    disabled={isAtLimit}
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
            {filteredMovies.length === 0 && (
              <li className="py-12 text-center text-sm text-[#66738a]">검색 결과가 없습니다.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e0e5ed] bg-white p-4 min-[621px]:p-[23px] min-[621px]:min-h-[765px]" aria-labelledby="selected-movies-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="selected-movies-heading" className="text-xl font-bold">선택한 영화</h2>
            <span className="text-[13px] font-bold text-[#037069]">{selectedIds.length} / 5편</span>
          </div>
          <p className="mt-2 text-xs text-[#66738a]">비교할 영화를 선택하세요.</p>
          <div className="mt-4 border-t border-[#e0e5ed] pt-[22px]">
            <ul className="space-y-[18px]">
              {selectedMovies.map((movie) => (
                <li key={movie.id} className="flex min-h-20 items-center gap-3 rounded-xl border border-[#e0e5ed] p-2.5 min-[621px]:gap-4 min-[621px]:p-3">
                  <Poster />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold">{movie.title}</h3>
                    <p className="mt-2 truncate text-xs text-[#66738a]">감독 · {movie.director}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMovie(movie.id)}
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
