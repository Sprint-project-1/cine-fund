export default function FundingComment({ comments }) {
    return (
        <div className="divide-y divide-gray-200">
            {comments.map((comment, index) => (
                <div key={index} className="py-4 flex items-end justify-between gap-4">
                    {/* Left: Name, Date, and Comment text */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{comment.name}</span>
                            <span className="text-xs text-gray-400">{comment.date}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.comment}</p>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
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