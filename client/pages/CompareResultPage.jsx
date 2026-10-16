import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AiSummaryModal from "../components/AiSummaryModal.jsx";


const rows = [
  { label: "장르", getValue: (movie) => (movie.tags ?? []).join(", ") || "-" },
  { label: "감독", getValue: (movie) => movie.director || "-" },
  { label: "펀딩 금액", getValue: (movie) => movie.fundingAmount ?? "-" },
  { label: "달성률", getValue: (movie) => movie.achievementRate ?? "-" },
];

export default function CompareResultPage() {
  const { state } = useLocation();
  const movies = state?.movies ?? [];
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);


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

  const columns = { gridTemplateColumns: `120px repeat(${movies.length}, 1fr)` };
  async function copyResult() {
    const text = movies.map((movie) => movie.title).join(" vs ");
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
            선택한 영화의 정보와 펀딩 지표를 나란히 확인하세요.
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

      <div className="rounded-3xl bg-white p-6">
        <div className="grid gap-4" style={columns}>
          <div />
          {movies.map((movie) => (
            <div key={movie.id} className="rounded-2xl bg-[#f1f2f6] p-4">
              <div className="aspect-[2/3] rounded-xl bg-[#5d4a6b]" />
              <h2 className="mt-4 text-lg font-bold">{movie.title}</h2>
            </div>
          ))}
        </div>
      <div className="mt-8">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className={`grid gap-4 rounded-xl py-5 ${index % 2 === 0 ? "bg-[#f5f6f8]" : ""}`}
              style={columns}
            >
              <div className="px-4 text-sm text-[#697180]">{row.label}</div>
              {movies.map((movie) => (
                <div key={movie.id} className="px-4 text-sm">{row.getValue(movie)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

        <div className="mt-8 flex justify-end gap-3">
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

