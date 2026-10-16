import { Link, useLocation } from "react-router";

export default function CompareResultPage() {
  const { state } = useLocation();
  const movies = state?.movies ?? [];

  // 새로고침 등으로 선택 정보가 없거나 2개 미만이면 안내
  if (movies.length < 2) {
    return (
      <section className="mx-auto max-w-[640px] pt-16 text-center">
        <p className="text-[#697180]">비교할 영화를 먼저 선택해 주세요.</p>
        <Link to="/compare" className="mt-4 inline-block font-bold text-[#037069]">
          영화 선택하러 가기
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-[calc(100vw-2rem)] max-w-[1282px] pt-6 pb-12">
      <h1 className="text-3xl font-bold">비교 결과</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left">항목</th>
              {movies.map((m) => (
                <th key={m.id} className="p-3 text-left">{m.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="p-3 text-left">감독</th>
              {movies.map((m) => (
                <td key={m.id} className="p-3">{m.director}</td>
              ))}
            </tr>
            {/* 설명·펀딩액·달성률 행은 데이터가 정해지면 같은 방식으로 추가 */}
          </tbody>
        </table>
      </div>
      <Link to="/compare" className="mt-8 inline-block font-bold text-[#037069]">
        다시 선택하기
      </Link>
    </section>
  );
}
