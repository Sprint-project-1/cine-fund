export default function FundingComment({ comments = [], onEdit, onCancel }) {
  return (
    <div className="divide-y divide-gray-200">
      {comments.map((comment) => (
        <div key={comment.fundingId} className="flex min-w-0 flex-col gap-3 py-4 min-[540px]:flex-row min-[540px]:items-end min-[540px]:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2"><span className="font-semibold text-gray-900">{comment.nickname}</span><time className="text-xs text-gray-400" dateTime={comment.createdAt}>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("ko-KR") : ""}</time></div>
            <p className="break-words text-sm text-gray-700">{comment.comment}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" onClick={() => onEdit?.(comment)} className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100">수정</button>
            <button type="button" onClick={() => onCancel?.(comment)} className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-red-600 transition-colors hover:border-red-200 hover:bg-red-50">펀딩 취소</button>
          </div>
        </div>
      ))}
    </div>
  );
}
