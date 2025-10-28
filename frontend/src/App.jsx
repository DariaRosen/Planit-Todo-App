import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { PlanitLayout } from "./layouts/PlanitLayout"
import { WeekPlanner } from "./pages/WeekPlanner"
import { Tasks } from "./pages/Tasks"

export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PlanitLayout />}>
          <Route path="/" element={<WeekPlanner />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
