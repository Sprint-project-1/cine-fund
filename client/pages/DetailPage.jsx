import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import FundingComment from "../components/FundingComment.jsx";

export default function DetailPage() {
  const { state } = useLocation();
  const movieId = state?.movieId ?? state?.movie?.movieId ?? state?.movie?.id;
  const [result, setResult] = useState({ movieId: null, movie: null, error: "" });
  const [confirmBox, setConfirmBox] = useState(false);

  useEffect(() => {
    if (!movieId) return;

    const controller = new AbortController();

    fetch(`/api/movies/${encodeURIComponent(movieId)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error?.message || "영화 정보를 불러오지 못했습니다.");
        }
        if (!body?.movie || body.movie.movieId !== Number(movieId)) {
          throw new Error("영화 상세 응답 형식이 올바르지 않습니다.");
        }
        return body.movie;
      })
      .then((movie) => setResult({ movieId, movie, error: "" }))
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setResult({ movieId, movie: null, error: cause.message });
        }
      });

    return () => controller.abort();
  }, [movieId]);

  if (!movieId) {
    return <p className="py-16 text-center text-sm text-red-700" role="alert">영화를 찾을 수 없습니다. 영화 목록에서 다시 선택해 주세요.</p>;
  }

  const isCurrentResult = result.movieId === movieId;
  if (!isCurrentResult) {
    return <p className="py-16 text-center text-sm text-[#697180]" role="status">영화 정보를 불러오는 중입니다.</p>;
  }

  if (result.error || !result.movie) {
    return <p className="py-16 text-center text-sm text-red-700" role="alert">{result.error || "영화 정보를 찾을 수 없습니다."}</p>;
  }

  const movie = result.movie;
  const fundingAmount = BigInt(movie.totalFundedAmount || "0");
  const targetAmount = movie.productionBudget === null ? null : BigInt(movie.productionBudget);
  const goalAchievement = targetAmount && targetAmount > 0n
    ? Number((fundingAmount * 10000n) / targetAmount) / 100
    : null;
  const progress = goalAchievement === null ? 0 : Math.min(goalAchievement, 100);
  const comments = [];

  return (
    <div className="min-w-0 pb-12">
      <section className="my-6 flex min-w-0 flex-col gap-6 min-[768px]:flex-row min-[768px]:items-stretch">
        <img
          className="h-auto w-full max-w-[320px] self-center rounded-lg object-cover min-[768px]:w-[320px] min-[768px]:shrink-0 min-[768px]:self-start"
          src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : undefined}
          alt={`${movie.title} 포스터`}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4 min-[768px]:min-h-[480px] min-[768px]:pt-12">
          <header className="min-w-0">
            <h1 className="break-words text-2xl font-extrabold leading-tight sm:text-3xl">{movie.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {(movie.genres ?? []).map((genre) => (
                <span key={genre} className="rounded-full bg-[#d9ecea] px-3 py-1 text-xs font-bold text-primary">
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-3 grid min-w-0 gap-1">
              <p className="min-w-0 break-words text-[13px] leading-6"><span className="mr-2 font-bold text-[#697180]">감독</span>{movie.director}</p>
              <p className="min-w-0 break-words text-[13px] leading-6"><span className="mr-2 font-bold text-[#697180]">배우</span>{(movie.actors ?? []).join(", ") || "정보 없음"}</p>
            </div>
          </header>

          <p className="m-0 min-w-0 break-words text-base font-bold leading-7 text-black">{movie.overview || "등록된 영화 설명이 없습니다."}</p>

          <section className="min-w-0 rounded-lg border border-[#E6EAF0] bg-white p-4 min-[768px]:mt-auto" aria-labelledby="funding-status-title">
            <h2 id="funding-status-title" className="pb-4 font-bold">펀딩 현황</h2>
            <div className="grid grid-cols-2 gap-4 min-[520px]:grid-cols-3 min-[520px]:gap-3">
              <div className="min-w-0">
                <p className="pb-2 text-sm text-[#697180]">현재 금액</p>
                <p className="break-all text-xl font-bold sm:text-2xl">₩ {fundingAmount.toLocaleString("ko-KR")}</p>
              </div>
              <div className="min-w-0">
                <p className="pb-2 text-sm text-[#697180]">목표 금액</p>
                <p className="break-all text-xl font-bold sm:text-2xl">{targetAmount === null ? "—" : `₩ ${targetAmount.toLocaleString("ko-KR")}`}</p>
              </div>
              <div className="min-w-0">
                <p className="pb-2 text-sm text-[#697180]">달성률</p>
                <p className="text-xl font-bold sm:text-2xl">{goalAchievement === null ? "산정 불가" : `${Math.round(goalAchievement)}%`}</p>
              </div>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label="펀딩 목표 달성률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={goalAchievement === null ? undefined : Math.round(progress)}>
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </section>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="min-w-0 rounded-lg border border-[#E6EAF0] bg-white p-4 sm:p-6">
          <h2 className="mb-2 font-bold">펀딩 코멘트</h2>
          <FundingComment comments={comments} />
        </div>

        <form className="h-min min-w-0 rounded-lg border border-[#E6EAF0] bg-white p-4 sm:p-6">
          <h2 className="mb-4 font-bold">펀딩 참여</h2>
          <label className="my-2 block text-sm font-bold" htmlFor="nickname">닉네임</label>
          <input className="w-full min-w-0 rounded-lg border border-[#D7DFEA] bg-[#F8FAFC] px-4 py-2 text-sm outline-primary" id="nickname" type="text" placeholder="닉네임 입력" />
          <label className="my-2 block text-sm font-bold" htmlFor="fund-amount">펀딩 금액</label>
          <input className="w-full min-w-0 rounded-lg border border-[#D7DFEA] bg-[#F8FAFC] px-4 py-2 text-sm outline-primary" id="fund-amount" type="text" placeholder="펀딩 금액 입력" />
          <label className="my-2 block text-sm font-bold" htmlFor="comment">코멘트</label>
          <textarea className="h-20 w-full min-w-0 resize-y rounded-lg border border-[#D7DFEA] bg-[#F8FAFC] px-4 py-2 text-sm outline-primary" id="comment" placeholder="코멘트 입력" />
          <label className="my-2 block text-sm font-bold" htmlFor="comment-password">비밀번호</label>
          <input className="w-full min-w-0 rounded-lg border border-[#D7DFEA] bg-[#F8FAFC] px-4 py-2 text-sm outline-primary" id="comment-password" type="password" placeholder="비밀번호 설정" />
          <p className="py-2 text-xs text-[#667085]">코멘트 수정 시 사용할 비밀번호</p>

          <div className="mt-2 flex items-start gap-2">
            <input className="mt-0.5 size-4 shrink-0" id="confirm" type="checkbox" checked={confirmBox} onChange={(event) => setConfirmBox(event.target.checked)} />
            <label htmlFor="confirm" className="text-xs leading-5 text-[#667085]">펀딩 및 코멘트 작성 내용을 확인했습니다.</label>
          </div>

          <button type="submit" className="mx-auto mt-4 block rounded-lg bg-primary px-10 py-2 text-sm font-bold text-white disabled:bg-gray-300" disabled={!confirmBox}>펀딩 완료</button>
        </form>
      </section>
    </div>
  );
}
