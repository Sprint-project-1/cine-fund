import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router";
import { Menu, Search, X } from "lucide-react";
import { fetchMovies } from "../api/movies.js";
import SkeletonBlock from "./SkeletonBlock.jsx";

const navLinks = [
  { to: "/", label: "영화 탐색" },
  { to: "/compare", label: "영화 비교" },
  { to: "/ranking", label: "펀딩 랭킹" },
];

export default function Navbar() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  return <NavbarContent initialQuery={initialQuery} />;
}

function NavbarContent({ initialQuery }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setIsSuggestionsLoading(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const matches = [];
        let cursor;

        for (let page = 0; page < 2; page += 1) {
          const result = await fetchMovies(
            { limit: 50, cursor, q: searchTerm },
            { signal: controller.signal },
          );
          matches.push(...result.items);
          if (!result.page.hasMore || !result.page.nextCursor) break;
          cursor = result.page.nextCursor;
        }

        const normalizedTerm = searchTerm.toLocaleLowerCase("ko-KR");
        setSuggestions(
          matches
            .filter((movie) => movie.title.toLocaleLowerCase("ko-KR").startsWith(normalizedTerm))
            .slice(0, 8),
        );
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  function selectSuggestion(movie) {
    setQuery(movie.title);
    setIsSuggestionsOpen(false);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/?q=${encodeURIComponent(movie.title)}`);
  }

  function suggestionList() {
    if (!isSuggestionsOpen || !query.trim()) return null;

    return (
      <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-xl" role="listbox" aria-label="영화 검색 제안" aria-busy={isSuggestionsLoading}>
        {isSuggestionsLoading && suggestions.length === 0 ? (
          <div role="status" aria-label="검색 제안을 불러오는 중" className="space-y-3 px-4 py-3">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center gap-3"><SkeletonBlock className="size-8 shrink-0 rounded-full" /><SkeletonBlock className={`h-4 ${index % 2 === 0 ? "w-2/3" : "w-1/2"}`} /></div>)}
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((movie) => (
            <button
              key={movie.movieId}
              type="button"
              role="option"
              aria-selected="false"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(movie)}
              className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-[#f5f7fa]"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f5f6f8] text-[#8a919d]"><Search aria-hidden="true" className="size-4" /></span>
              <span className="min-w-0 flex-1 truncate text-[#161a22]">{movie.title}</span>
            </button>
          ))
        ) : (
          <p className="px-4 py-3 text-sm text-[#697180]">일치하는 영화가 없습니다.</p>
        )}
      </div>
    );
  }

  function handleSearch(event) {
    event.preventDefault();
    const searchTerm = query.trim();
    navigate(searchTerm ? `/?q=${encodeURIComponent(searchTerm)}` : "/");
    setIsSuggestionsOpen(false);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
  }

  function closeMobilePanels() {
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] h-[68px] w-full max-w-[100vw] border-b border-[#DDE1E8] bg-white/95 px-4 backdrop-blur-[12px] min-[911px]:px-12">
      <div className="flex h-full w-full min-w-0 items-center justify-between gap-3">
        <h1 className="m-0 w-[150px] shrink-0 leading-none min-[911px]:w-[172px]">
          <Link to="/" aria-label="CineFund 홈으로 이동" className="block">
            <img src="/images/logo.png" alt="CineFund" className="block h-auto w-full" />
          </Link>
        </h1>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 whitespace-nowrap text-[13px] font-medium text-black min-[911px]:flex min-[911px]:flex-none min-[911px]:gap-8 min-[911px]:text-base">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `flex h-full shrink-0 items-center border-b-2 px-1 transition-colors ${isActive ? "border-primary font-bold text-primary" : "border-transparent text-black hover:text-primary"}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="relative hidden w-[min(28vw,300px)] min-w-[140px] shrink min-[911px]:block">
          <form onSubmit={handleSearch} className="flex h-11 items-center rounded-xl border border-[#DDE1E8] bg-[#F0F2F5]">
            <div className="ml-3 mr-2 grid size-6 shrink-0 place-items-center">
              <Search aria-hidden="true" className="size-5" />
            </div>
            <input
              type="search"
              value={query}
              onFocus={() => setIsSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setIsSuggestionsOpen(false), 100)}
              onChange={(event) => { setQuery(event.target.value); setIsSuggestionsOpen(true); }}
              onKeyDown={(event) => { if (event.key === "Escape") setIsSuggestionsOpen(false); }}
              placeholder="영화 검색"
              aria-label="영화 검색"
              aria-expanded={isSuggestionsOpen && Boolean(query.trim())}
              aria-controls="movie-suggestions-desktop"
              className="min-w-0 flex-1 border-0 bg-transparent pr-3 text-sm outline-0"
            />
          </form>
          <div id="movie-suggestions-desktop">{suggestionList()}</div>
        </div>

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-0 min-[911px]:hidden">
          <button
            type="button"
            aria-label={isMobileSearchOpen ? "검색 닫기" : "검색"}
            aria-expanded={isMobileSearchOpen}
            onClick={() => {
              setIsMobileSearchOpen((isOpen) => !isOpen);
              setIsMobileMenuOpen(false);
            }}
            className="flex size-10 items-center justify-center rounded-full"
          >
            <Search aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => {
              setIsMobileMenuOpen((isOpen) => !isOpen);
              setIsMobileSearchOpen(false);
            }}
            className="flex size-10 items-center justify-center rounded-full"
          >
            {isMobileMenuOpen ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
          </button>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="absolute inset-x-3 top-[calc(100%+8px)] min-[911px]:hidden">
          <form onSubmit={handleSearch} className="relative flex h-12 items-center rounded-xl border border-[#DDE1E8] bg-white px-3 shadow-lg">
            <Search aria-hidden="true" className="mr-2 size-5 shrink-0 text-[#697180]" />
            <input
              autoFocus
              type="search"
              value={query}
              onFocus={() => setIsSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setIsSuggestionsOpen(false), 100)}
              onChange={(event) => { setQuery(event.target.value); setIsSuggestionsOpen(true); }}
              onKeyDown={(event) => { if (event.key === "Escape") setIsSuggestionsOpen(false); }}
              placeholder="영화 검색"
              aria-label="영화 검색"
              aria-expanded={isSuggestionsOpen && Boolean(query.trim())}
              aria-controls="movie-suggestions-mobile"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button type="submit" className="ml-2 shrink-0 text-sm font-bold text-[#037069]">검색</button>
          </form>
          <div id="movie-suggestions-mobile">{suggestionList()}</div>
        </div>
      )}

      {isMobileMenuOpen && (
        <nav aria-label="모바일 메뉴" className="absolute right-3 top-[calc(100%+8px)] flex min-w-44 flex-col rounded-xl border border-[#DDE1E8] bg-white p-2 shadow-lg min-[911px]:hidden">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={closeMobilePanels}
              className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-[#E6F3F1] font-bold text-primary" : "font-medium text-[#161a22] hover:bg-[#F0F2F5]"}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
