import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { PlanitLayout } from "./layouts/PlanitLayout"
import { WeekPlanner } from "./pages/WeekPlanner"

export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PlanitLayout />}>
          <Route path="/" element={<WeekPlanner />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
