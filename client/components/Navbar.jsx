import {Link} from "react-router";

export default function Navbar() {
    return (
        <header className="table-header-group">
            <div className="header-container">
                <h1 className="logo_images" herf="">
                    <img src="../public/images/logo.png" alt="Logo" className="logo" />
                </h1>
                <nav className="header-items">
                    <Link to="/">영화 탐색</Link>
                    <Link to="/compare">영화 비교</Link>
                    <Link to="/ranking">펀딩 랭킹</Link>
                </nav>
                <form className="search-form">
                    <div className="serch-icon">⌕</div>
                    <input type="text" placeholder="영화 검색" className="search-input" />
                </form>
                <nav className="header-mobile-container">
                    <button className="header-mobile-button">⌕</button>
                    <button className="header-mobile-button">☰</button>
                </nav>
            </div>
        </header>
    )
}