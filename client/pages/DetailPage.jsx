import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import FundingComment from "../components/FundingComment.jsx";
import SkeletonBlock from "../components/SkeletonBlock.jsx";
import { cancelFunding, createFunding, fetchComments, fetchMovie, updateFundingComment } from "../api/movies.js";

const money = (value) => value == null ? "—" : `₩ ${BigInt(value).toLocaleString("ko-KR")}`;
const percent = (funded, goal) => {
  if (funded == null || goal == null || BigInt(goal) <= 0n) return null;
  return Number((BigInt(funded) * 100n) / BigInt(goal));
};

function PasswordDialog({ title, onClose, onSubmit, children }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try { await onSubmit(password); onClose(); }
    catch (cause) { setError(cause.message || "요청을 처리하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="flex items-start justify-between gap-4"><h2 id="dialog-title" className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="닫기" className="text-2xl leading-none text-gray-500">×</button></div>
        {children}
        <label className="mt-4 block text-sm font-semibold" htmlFor="funding-password">비밀번호</label>
        <input id="funding-password" type="password" required minLength={8} maxLength={12} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" />
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">취소</button><button disabled={busy} type="submit" className="rounded-lg bg-primary px-4 py-2 font-bold text-white disabled:opacity-60">{busy ? "처리 중…" : "확인"}</button></div>
      </form>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-w-0 pb-12" role="status" aria-label="영화 정보를 불러오는 중">
      <section className="my-6 flex min-w-0 flex-col gap-6 min-[768px]:flex-row">
        <SkeletonBlock className="aspect-[2/3] w-full max-w-[320px] self-center rounded-lg min-[768px]:shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-4 min-[768px]:pt-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-9 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
            <div className="flex gap-2"><SkeletonBlock className="h-7 w-16 rounded-full" /><SkeletonBlock className="h-7 w-20 rounded-full" /></div>
            <SkeletonBlock className="h-4 w-2/5" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
          </div>
          <div className="mt-auto rounded-lg border border-[#E6EAF0] bg-white p-4">
            <SkeletonBlock className="mb-5 h-5 w-32" />
            <div className="grid grid-cols-2 gap-4 min-[520px]:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-2"><SkeletonBlock className="h-4 w-20" /><SkeletonBlock className="h-6 w-28" /></div>)}
            </div>
            <SkeletonBlock className="mt-4 h-3 w-full rounded-full" />
          </div>
        </div>
      </section>
      <section className="grid min-w-0 grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="rounded-lg border border-[#E6EAF0] bg-white p-4 sm:p-6">
          <SkeletonBlock className="mb-5 h-5 w-28" />
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="flex gap-3 border-t border-[#E6EAF0] py-4"><SkeletonBlock className="size-10 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><SkeletonBlock className="h-4 w-1/3" /><SkeletonBlock className="h-4 w-full" /></div></div>)}
        </div>
        <div className="h-[420px] rounded-lg border border-[#E6EAF0] bg-white p-4 sm:p-6"><SkeletonBlock className="h-5 w-24" /></div>
      </section>
    </div>
  );
}

export default function DetailPage() {
  const { movieId: routeMovieId } = useParams();
  const { state } = useLocation();
  const movieId = routeMovieId ?? state?.movieId ?? state?.movie?.movieId;
  const [movie, setMovie] = useState(state?.movie ?? null);
  const [comments, setComments] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [funding, setFunding] = useState({ nickname: "", amount: "", comment: "", password: "", consent: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    if (!movieId) return undefined;
    const controller = new AbortController();
    fetchMovie(movieId, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) { setMovie(data); setError(""); } })
      .catch((cause) => { if (!controller.signal.aborted) { setError(cause.message || "영화 정보를 불러오지 못했습니다."); setMovie(null); } })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [movieId, refresh]);

  useEffect(() => {
    if (!movieId) return undefined;
    const controller = new AbortController();
    fetchComments(movieId, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) { setComments(result.items); setNextCursor(result.page.nextCursor); setHasMore(result.page.hasMore); } })
      .catch((cause) => { if (!controller.signal.aborted) setCommentError(cause.message || "코멘트를 불러오지 못했습니다."); })
      .finally(() => { if (!controller.signal.aborted) setIsLoadingComments(false); });
    return () => controller.abort();
  }, [movieId, refresh]);

  async function loadMoreComments() {
    if (!nextCursor || !hasMore || isLoadingComments) return;
    setIsLoadingComments(true);
    setCommentError("");
    try {
      const result = await fetchComments(movieId, { cursor: nextCursor });
      setComments((current) => [...current, ...result.items]);
      setNextCursor(result.page.nextCursor);
      setHasMore(result.page.hasMore);
    } catch (cause) { setCommentError(cause.message || "코멘트를 더 불러오지 못했습니다."); }
    finally { setIsLoadingComments(false); }
  }

  async function submitFunding(event) {
    event.preventDefault();
    if (!funding.consent) return;
    setIsSubmitting(true);
    setNotice("");
    try {
      const result = await createFunding(movieId, { amount: funding.amount.trim(), nickname: funding.nickname.trim(), comment: funding.comment, password: funding.password });
      if (result.totalFundedAmount != null) setMovie((current) => ({ ...current, totalFundedAmount: result.totalFundedAmount }));
      setFunding({ nickname: "", amount: "", comment: "", password: "", consent: false });
      setNotice("모의 펀딩이 등록되었습니다.");
      setRefresh((n) => n + 1);
    } catch (cause) { setNotice(cause.message || "모의 펀딩을 등록하지 못했습니다."); }
    finally { setIsSubmitting(false); }
  }

  async function performAction(password) {
    if (activeAction.type === "cancel") {
      const result = await cancelFunding(activeAction.fundingId, password);
      setMovie((current) => ({ ...current, totalFundedAmount: result.totalFundedAmount }));
      setComments((current) => current.filter((item) => item.fundingId !== activeAction.fundingId));
      setNotice("모의 펀딩 기록을 취소했습니다.");
    } else {
      await updateFundingComment(activeAction.fundingId, password, activeAction.comment);
      setComments((current) => current.map((item) => item.fundingId === activeAction.fundingId ? { ...item, comment: activeAction.comment } : item));
      setNotice("코멘트를 수정했습니다.");
    }
  }

  if (!movieId) return <section className="py-16 text-center"><p className="text-gray-600">영화 식별자가 없습니다.</p><Link to="/" className="mt-4 inline-block text-primary">영화 목록으로</Link></section>;
  if (isLoading) return <DetailSkeleton />;
  if (error || !movie) return <section className="py-16 text-center"><p role="alert" className="text-gray-600">{error || "영화를 찾을 수 없습니다."}</p><button type="button" onClick={() => setRefresh((n) => n + 1)} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">다시 시도</button><p><Link to="/" className="mt-4 inline-block text-primary">영화 목록으로</Link></p></section>;

  const achievement = percent(movie.totalFundedAmount, movie.productionBudget);
  return (
    <div className="min-w-0 pb-12 text-[#141c2b]">
      <section className="my-6 flex min-w-0 flex-col gap-6 min-[768px]:flex-row">
        {movie.posterPath ? <img className="h-auto w-full max-w-[320px] self-center rounded-lg object-cover min-[768px]:w-[320px] min-[768px]:shrink-0 min-[768px]:self-start" src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={`${movie.title} 포스터`} /> : <div className="flex aspect-[2/3] w-full max-w-[320px] items-center justify-center self-center rounded-lg bg-gray-200 text-gray-500">포스터 없음</div>}
        <div className="flex min-w-0 flex-1 flex-col gap-4 min-[768px]:pt-4">
          <header className="min-w-0"><p className="text-sm font-bold tracking-wide text-primary">MOVIE DETAIL</p><h1 className="mt-2 break-words text-2xl font-extrabold leading-tight sm:text-3xl">{movie.title}</h1><p className="mt-2 text-sm text-gray-500">{[movie.releaseDate, movie.koreanCertification].filter(Boolean).join(" · ")}</p><div className="mt-3 flex flex-wrap gap-2">{(movie.genres ?? []).map((genre) => <span key={genre} className="rounded-full bg-[#d9ecea] px-3 py-1 text-xs font-bold text-primary">{genre}</span>)}</div><div className="mt-3 grid gap-1 text-[13px] leading-6"><p><b className="mr-2 text-gray-500">감독</b>{movie.director || "정보 없음"}</p><p><b className="mr-2 text-gray-500">출연</b>{movie.actors?.join(", ") || "정보 없음"}</p></div></header>
          {movie.tagline && <p className="font-bold">{movie.tagline}</p>}{movie.overview && <p className="break-words text-sm leading-7 text-gray-700">{movie.overview}</p>}
          <section className="mt-auto rounded-lg border border-[#E6EAF0] bg-white p-4" aria-labelledby="funding-status-title"><h2 id="funding-status-title" className="pb-4 font-bold">펀딩 현황 · 모의</h2><div className="grid grid-cols-2 gap-4 min-[520px]:grid-cols-3"><div><p className="pb-2 text-sm text-gray-500">현재 금액</p><p className="break-all text-lg font-bold">{money(movie.totalFundedAmount)}</p></div><div><p className="pb-2 text-sm text-gray-500">목표 금액</p><p className="break-all text-lg font-bold">{money(movie.productionBudget)}</p></div><div><p className="pb-2 text-sm text-gray-500">달성률</p><p className="text-lg font-bold">{achievement == null ? "산정 불가" : `${achievement}%`}</p></div></div><div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label="펀딩 목표 달성률" aria-valuemin="0" aria-valuemax="100" {...(achievement == null ? {} : { "aria-valuenow": Math.min(achievement, 100) })}><div className="h-full bg-primary" style={{ width: `${achievement == null ? 0 : Math.min(achievement, 100)}%` }} /></div></section>
        </div>
      </section>
      <section className="grid min-w-0 grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="min-w-0 rounded-lg border border-[#E6EAF0] bg-white p-4 sm:p-6" aria-busy={isLoadingComments}><h2 className="mb-2 font-bold">펀딩 코멘트</h2>{isLoadingComments && comments.length === 0 && <div role="status" aria-label="코멘트를 불러오는 중" className="space-y-4 py-4">{Array.from({ length: 3 }, (_, index) => <div key={index} className="flex gap-3 border-t border-[#E6EAF0] pt-4"><SkeletonBlock className="size-10 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><SkeletonBlock className="h-4 w-1/3" /><SkeletonBlock className="h-4 w-full" /></div></div>)}</div>}{commentError && <p role="alert" className="py-4 text-sm text-red-700">{commentError}</p>}{!isLoadingComments && comments.length === 0 && !commentError && <p className="py-6 text-sm text-gray-500">등록된 코멘트가 없습니다.</p>}<FundingComment comments={comments} onEdit={(item) => setActiveAction({ type: "edit", fundingId: item.fundingId, comment: item.comment })} onCancel={(item) => setActiveAction({ type: "cancel", fundingId: item.fundingId })} />{isLoadingComments && comments.length > 0 && <div role="status" aria-label="코멘트를 더 불러오는 중" className="space-y-3 py-4">{Array.from({ length: 2 }, (_, index) => <SkeletonBlock key={index} className="h-16 w-full rounded-xl" />)}</div>}{hasMore && <button type="button" onClick={loadMoreComments} disabled={isLoadingComments} className="mt-4 w-full rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-60">{isLoadingComments ? "불러오는 중…" : "코멘트 더 보기"}</button>}</div>
        <form onSubmit={submitFunding} className="h-min min-w-0 rounded-lg border border-[#E6EAF0] bg-white p-4 sm:p-6"><h2 className="mb-2 font-bold">펀딩 참여</h2><p className="mb-4 text-xs text-gray-500">실제 결제가 없는 모의 펀딩입니다.</p><label className="my-2 block text-sm font-bold" htmlFor="nickname">닉네임</label><input className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" id="nickname" type="text" required maxLength={8} value={funding.nickname} onChange={(e) => setFunding({ ...funding, nickname: e.target.value })} placeholder="최대 8글자" /><label className="my-2 block text-sm font-bold" htmlFor="fund-amount">펀딩 금액</label><input className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" id="fund-amount" type="number" min="1" step="1" required value={funding.amount} onChange={(e) => setFunding({ ...funding, amount: e.target.value })} placeholder="금액 입력" /><label className="my-2 block text-sm font-bold" htmlFor="fund-comment">코멘트</label><textarea className="h-20 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm" id="fund-comment" maxLength={100} value={funding.comment} onChange={(e) => setFunding({ ...funding, comment: e.target.value })} placeholder="최대 100글자" /><label className="my-2 block text-sm font-bold" htmlFor="comment-password">비밀번호</label><input className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" id="comment-password" type="password" minLength={8} maxLength={12} required value={funding.password} onChange={(e) => setFunding({ ...funding, password: e.target.value })} placeholder="영문과 숫자 포함, 8~12자" /><p className="py-2 text-xs text-gray-500">코멘트 수정 및 모의 펀딩 취소 시 확인에 사용합니다.</p><div className="mt-2 flex items-start gap-2"><input className="mt-0.5 size-4 shrink-0" id="confirm" type="checkbox" required checked={funding.consent} onChange={(e) => setFunding({ ...funding, consent: e.target.checked })} /><label htmlFor="confirm" className="text-xs leading-5 text-gray-600">펀딩 및 코멘트 작성 내용을 확인했습니다.</label></div>{notice && <p role="status" className="mt-3 text-sm text-primary">{notice}</p>}<button type="submit" disabled={!funding.consent || isSubmitting} className="mx-auto mt-4 block rounded-lg bg-primary px-10 py-2 text-sm font-bold text-white disabled:bg-gray-300">{isSubmitting ? "등록 중…" : "모의 펀딩 완료"}</button></form>
      </section>
      {activeAction && <PasswordDialog title={activeAction.type === "cancel" ? "모의 펀딩 취소" : "코멘트 수정"} onClose={() => setActiveAction(null)} onSubmit={performAction}>{activeAction.type === "cancel" ? <p className="mt-4 text-sm text-gray-600">해당 모의 펀딩 기록을 취소할까요? 실제 결제나 환불은 발생하지 않습니다.</p> : <><label htmlFor="edit-comment" className="mt-4 block text-sm font-semibold">코멘트</label><textarea id="edit-comment" maxLength={100} required value={activeAction.comment} onChange={(event) => setActiveAction({ ...activeAction, comment: event.target.value })} className="mt-2 h-24 w-full rounded-lg border border-gray-300 p-3" /></>}</PasswordDialog>}
    </div>
  );
}
