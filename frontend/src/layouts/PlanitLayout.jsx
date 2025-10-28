import { Outlet } from "react-router-dom"

export function PlanitLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-blue-600 text-white py-3 text-center text-xl font-semibold">
                🪐 Planit – Weekly Planner
            </header>

            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    )
}
