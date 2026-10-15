export default function AiSummaryModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-3xl bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-3xl font-bold">AI 비교 요약</h2>
        <p className="mt-3 text-sm text-[#697180]">
          선택한 영화 정보를 바탕으로 비교 내용을 정리했습니다.
        </p>

        <div className="mt-5 rounded-2xl bg-[#f0ffff] p-4">
          <h3 className="text-sm font-bold text-primary">핵심 요약</h3>
          <p className="mt-3 text-sm">영화의 주요 정보와 펀딩 지표를 바탕으로 한 요약 설명이 표시됩니다.</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#f5f6fa] p-4">
            <h3 className="text-sm font-bold text-[#697180]">공통점</h3>
            <p className="mt-3 text-sm">공통점 요약</p>
          </div>
          <div className="rounded-2xl bg-[#f5f6fa] p-4">
            <h3 className="text-sm font-bold text-[#697180]">차이점</h3>
            <p className="mt-3 text-sm">차이점 요약</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#e0e5ed] p-4">
          <h3 className="text-sm font-bold text-[#697180]">펀딩 지표 요약</h3>
          <p className="mt-3 text-sm">펀딩 금액 · 달성률 비교 요약</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-5 block h-12 w-[200px] rounded-2xl bg-primary font-bold text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}

