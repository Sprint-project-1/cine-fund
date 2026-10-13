import {Link} from "react-router";

export default function Navbar() {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="mx-auto flex items-center">
                <h1 className="text-xl font-bold">(로고 이미지)</h1>
                <nav className="mx-10 flex gap-4 text-sm font-medium">
                    <Link to="/">영화 탐색</Link>
                    <Link to="/compare">영화 비교</Link>
                    <Link to="/ranking">펀딩 랭킹</Link>
                </nav>
            </div>
        </header>
    )
}