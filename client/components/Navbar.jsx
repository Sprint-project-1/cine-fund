import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Menu, Search } from "lucide-react";

export default function Navbar() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get("q") ?? "";

    return <NavbarContent key={initialQuery} initialQuery={initialQuery} />;
}

function NavbarContent({ initialQuery }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState(initialQuery);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    function handleSearch(event) {
        event.preventDefault();
        const searchTerm = query.trim();
        navigate(searchTerm ? `/?q=${encodeURIComponent(searchTerm)}` : "/");
        setIsMobileSearchOpen(false);
    }

    return (
        <header className="fixed inset-x-0 top-0 z-[1000] flex h-20 items-center justify-center border-b border-[#DDE1E8] bg-white/70 px-4 backdrop-blur-[12px] min-[621px]:px-6 min-[911px]:px-[72px] max-[620px]:justify-between">
            <div className="flex h-20 w-full items-center justify-between">
                <h1 className="h-11 min-h-11 w-[132px] min-w-[132px]">
                    <img src="/images/logo.png" alt="CineFund" className="h-full w-full" />
                </h1>
                <nav className="flex w-max min-w-[239px] gap-[30px] text-base font-medium text-black min-[621px]:max-[910px]:gap-5 max-[620px]:hidden">
                    <Link to="/">영화 탐색</Link>
                    <Link to="/compare">영화 비교</Link>
                    <Link to="/ranking">펀딩 랭킹</Link>
                </nav>
                <form onSubmit={handleSearch} className="ml-[clamp(10px,7vw,120px)] flex h-[50px] w-[300px] items-center rounded-xl border border-[#DDE1E8] bg-[#F0F2F5] min-[621px]:max-[910px]:ml-5 min-[621px]:max-[910px]:w-[30%] max-[620px]:hidden">
                    <div className="ml-3 size-6 shrink-0"><Search aria-hidden="true" className="size-6" /></div>
                    <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="영화 검색" aria-label="영화 검색" className="min-w-0 flex-1 border-0 bg-transparent outline-0" />
                </form>
                <nav className="hidden items-center gap-2 max-[620px]:flex">
                    <button type="button" aria-label="검색" aria-expanded={isMobileSearchOpen} onClick={() => setIsMobileSearchOpen((isOpen) => !isOpen)} className="ml-3 flex size-10 items-center justify-center rounded-full text-2xl"><Search aria-hidden="true" className="size-6" /></button>
                    <button type="button" aria-label="메뉴" className="ml-3 flex size-10 items-center justify-center rounded-full text-2xl"><Menu aria-hidden="true" className="size-6" /></button>
                </nav>
            </div>
            {isMobileSearchOpen && (
                <form onSubmit={handleSearch} className="absolute inset-x-4 top-[calc(100%+8px)] flex h-12 items-center rounded-xl border border-[#DDE1E8] bg-white px-3 shadow-lg min-[621px]:hidden">
                    <Search aria-hidden="true" className="mr-2 size-5 shrink-0 text-[#697180]" />
                    <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="영화 검색" aria-label="영화 검색" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                    <button type="submit" className="ml-2 text-sm font-bold text-[#037069]">검색</button>
                </form>
            )}
        </header>
    )
}
