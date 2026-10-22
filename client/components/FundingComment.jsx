export default function FundingComment({ comments }) {
    return (
        <div className="divide-y divide-gray-200">
            {comments.map((comment, index) => (
                <div key={index} className="flex min-w-0 flex-col gap-3 py-4 min-[540px]:flex-row min-[540px]:items-end min-[540px]:justify-between">
                    {/* Left: Name, Date, and Comment text */}
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{comment.name}</span>
                            <span className="text-xs text-gray-400">{comment.date}</span>
                        </div>
                        <p className="break-words text-sm text-gray-700">{comment.comment}</p>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button className="text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded border border-gray-200 transition-colors">
                            수정
                        </button>
                        <button className="text-xs text-red-600 bg-gray-50 hover:bg-red-50 px-2.5 py-1 rounded border border-gray-200 hover:border-red-200 transition-colors">
                            펀딩 취소
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
