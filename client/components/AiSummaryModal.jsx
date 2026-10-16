import { X } from "lucide-react";

// AI 요약 기능은 아직 팀에서 정하지 않아, 시안의 자리표시 문구를 그대로 쓴다.
const summary = {
  headline: "영화의 주요 정보와 펀딩 지표를 바탕으로 한 요약 설명이 표시됩니다.",
  common: "공통점 요약",
  difference: "차이점 요약",
  funding: "펀딩 금액 · 달성률 비교 요약",
};

export default function AiSummaryModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 max-[620px]:items-end max-[620px]:p-0"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-white p-6 max-[620px]:max-w-none max-[620px]:rounded-b-none"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 데스크톱·태블릿: 가운데 팝업 */}
        <div className="max-[620px]:hidden">
          <div className="flex items-start justify-between">
            <span className="rounded-full bg-[#f0ffff] px-4 py-2 text-sm font-bold text-primary">AI 요약</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex size-9 items-center justify-center rounded-full border border-[#e0e5ed] bg-[#f5f7fa]"
            >
              <X className="size-4" />
            </button>
          </div>

          <h2 className="mt-4 text-3xl font-bold">AI 비교 요약</h2>
          <p className="mt-3 text-sm text-[#697180]">
            선택한 영화 정보를 바탕으로 비교 내용을 정리했습니다.
          </p>

          <div className="mt-5 rounded-2xl bg-[#f0ffff] p-4">
            <h3 className="text-sm font-bold text-primary">핵심 요약</h3>
            <p className="mt-3 text-sm">{summary.headline}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#f5f6fa] p-4">
              <h3 className="text-sm font-bold text-[#697180]">공통점</h3>
              <p className="mt-3 text-sm">{summary.common}</p>
            </div>
            <div className="rounded-2xl bg-[#f5f6fa] p-4">
              <h3 className="text-sm font-bold text-[#697180]">차이점</h3>
              <p className="mt-3 text-sm">{summary.difference}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e0e5ed] p-4">
            <h3 className="text-sm font-bold text-[#697180]">펀딩 지표 요약</h3>
            <p className="mt-3 text-sm">{summary.funding}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mx-auto mt-5 block h-12 w-[200px] rounded-2xl bg-primary font-bold text-white"
          >
            확인
          </button>
        </div>

        {/* 모바일: 아래에서 올라오는 시트 */}
        <div className="hidden max-[620px]:block">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-[#d4d9e4]" />

          <div className="mt-5 flex items-start justify-between">
            <h2 className="text-2xl font-bold">AI 비교 요약</h2>
            <button type="button" onClick={onClose} className="text-sm font-bold text-primary">
              닫기
            </button>
          </div>
          <p className="mt-2 text-sm text-[#697180]">선택한 영화의 비교 요약</p>

          {[
            { title: "요약", text: summary.headline },
            { title: "공통점", text: summary.common },
            { title: "차이점", text: summary.difference },
          ].map((section) => (
            <div key={section.title} className="mt-5">
              <h3 className="font-bold">{section.title}</h3>
              <p className="mt-3 rounded-xl bg-[#edf6f5] p-4 text-sm text-[#697180]">{section.text}</p>
            </div>
          ))}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 h-[50px] w-full rounded-xl bg-primary font-bold text-white"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
