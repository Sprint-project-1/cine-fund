import {comments, movies} from "../test-db.js"
import FundingComment from "../components/FundingComment.jsx"
import {useState} from "react";

export default function DetailPage() {

    const movie = movies[2];
    const [confirmBox, setConfirmBox] = useState(false);
    const goalAchievement = Math.ceil(movie.currentFunding / movie.fundingGoal * 100);

    return (
        <div className="">
            <div className="flex my-6">
                <img className="rounded-lg" src="https://image.tmdb.org/t/p/original/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg" width={320} alt=""/>
                <div className="flex flex-col ml-6 justify-between w-full">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {
                                movie.genre.map((genre, key) => (
                                    <p key={key} className="text-[12px] text-primary bg-primary/40 font-bold rounded-full px-4">{genre}</p>
                                ))
                            }
                        </div>
                        <h1 className="text-2xl font-extrabold pb-2">{movie.title}</h1>
                        <p className="text-[13px]">감독 · {movie.director}</p>
                        <p className="text-[13px]">배우 · {movie.cast.join(", ")}</p>
                        <p className="text-[#697180]">{movie.plot}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E6EAF0]">
                        <p className="font-bold pb-4">펀딩 현황</p>
                        <div className="flex gap-40 w-full">
                            <div>
                                <p className="text-sm pb-2">현재 금액</p>
                                <p className="text-2xl font-bold">₩ {movie.currentFunding.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm pb-2">목표 금액</p>
                                <p className="text-2xl font-bold">₩ {movie.fundingGoal.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm pb-2">달성률</p>
                                <p className="text-2xl font-bold">{goalAchievement}%</p>
                            </div>
                        </div>
                        <div className="bg-gray-200 w-full h-3 rounded-lg mt-4">
                            <div className="bg-primary h-3 rounded-lg mt-4" style={{ width: `${goalAchievement}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-white p-6 rounded-lg w-2/3 border border-[#E6EAF0]">
                    <p className="font-bold">펀딩 코멘트</p>
                    <FundingComment comments={comments}/>
                </div>
                <form className="bg-white p-6 rounded-lg w-1/3 h-min border border-[#E6EAF0]">
                    <p className="font-bold mb-4">펀딩 참여</p>
                    <label className="text-sm block my-2 font-bold" htmlFor="nickname">닉네임</label>
                    <input className="text-sm bg-[#F8FAFC] border border-[#D7DFEA] rounded-lg px-4 py-2 outline-primary w-full" id="nickname" type="text" placeholder="닉네임 입력"/>
                    <label className="text-sm block my-2 font-bold" htmlFor="fund-amount">펀딩 금액</label>
                    <input className="text-sm bg-[#F8FAFC] border border-[#D7DFEA] rounded-lg px-4 py-2 outline-primary w-full" id="fund-amount" type="text" placeholder="펀딩 금액 입력"/>
                    <label className="text-sm block my-2 font-bold" htmlFor="comment">코멘트</label>
                    <textarea className="h-20 text-sm bg-[#F8FAFC] border border-[#D7DFEA] rounded-lg px-4 py-2 outline-primary w-full" id="comment" type="text" placeholder="코멘트 입력"/>
                    <label className="text-sm block my-2 font-bold" htmlFor="fund-amount">비민번호</label>
                    <input className="text-sm bg-[#F8FAFC] border border-[#D7DFEA] rounded-lg px-4 py-2 outline-primary w-full" id="fund-amount" type="text" placeholder="비밀번호 설정"/>
                    <p className="text-xs text-[#667085] py-2">코멘트 수정 시 사용할 비밀번호</p>

                    <div className="flex mt-2">
                        <input className="w-4" id="confirm" type="checkbox" checked={confirmBox} onChange={e => setConfirmBox(e.target.checked)}/>
                        <label htmlFor="confirm" className="text-[12px] text-[#667085] mx-2">펀딩 및 코멘트 작성 내용을 확인했습니다.</label>
                    </div>

                    <button type="submit" className="bg-primary text-white text-sm font-bold block mt-4 mx-auto px-10 py-2 rounded-lg disabled:bg-gray-300" disabled={!confirmBox}>펀딩 완료</button>
                </form>
            </div>
        </div>
    )
}