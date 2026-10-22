import {Outlet} from "react-router";
import Navbar from "../components/Navbar";

export default function LayoutPage() {
    return (
        <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-clip bg-gray-50 text-gray-900">
            <Navbar />
            <main className="mx-auto min-h-0 w-full min-w-0 max-w-7xl flex-1 overflow-x-clip px-4 pt-[100px] min-[621px]:px-6 min-[1024px]:px-20">
                <Outlet />
            </main>
        </div>
    )
}
