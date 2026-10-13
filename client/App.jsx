import { Routes, Route } from 'react-router';
import HomePage from "./pages/HomePage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import CompareResultPage from "./pages/CompareResultPage.jsx";
import RankingPage from "./pages/RankingPage.jsx";
import LayoutPage from "./pages/LayoutPage.jsx";

function App() {
    return (
        <Routes>
            <Route element={<LayoutPage />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/detail" element={<DetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/compare-result" element={<CompareResultPage />} />
                <Route path="/ranking" element={<RankingPage />} />
            </Route>
        </Routes>
    );
}

export default App;