import { Outlet } from "react-router-dom"

export function PlanitLayout() {
    return (
        <div className="app-layout">
            <AppHeader />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}
