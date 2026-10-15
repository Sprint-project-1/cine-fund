import {Outlet} from "react-router";
import Navbar from "../components/Navbar";

export default function LayoutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-[100px] min-[621px]:px-6 min-[1024px]:px-20">
                <Outlet />
            </main>
        </div>
    )
}
