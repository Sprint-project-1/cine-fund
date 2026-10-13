import {Outlet} from "react-router";
import Navbar from "../components/Navbar";

export default function LayoutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto p-6">
                <Outlet />
            </main>
        </div>
    )
}