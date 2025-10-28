import { Outlet } from "react-router-dom"
import { Header } from "../components/Header"

export function PlanitLayout() {
    return (
        <div className="app-layout">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}
