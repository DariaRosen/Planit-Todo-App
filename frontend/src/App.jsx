import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PlanitLayout } from "./layouts/PlanitLayout";
import { WeekPlanner } from "./pages/WeekPlanner";
import { Tasks } from "./pages/Tasks";
import { UserPanel } from "./components/UserPanel";

export function App() {
  useEffect(() => {
    // ✅ Hardcode logged-in Daria for development/testing
    const existingUser = localStorage.getItem("loggedinUser");

    if (!existingUser) {
      const testUser = {
        id: 13,
        name: "Daria",
        email: "daria.sk135@gmail.com",
        avatar_url:
          "https://res.cloudinary.com/dool6mmp1/image/upload/v1758109525/women1_a3rukf.jpg",
        is_main_user: 1,
        is_logged_in: 1,
      };

      localStorage.setItem("loggedinUser", JSON.stringify(testUser));
      console.log("👤 Hardcoded login active:", testUser);
    } else {
      console.log("👤 Using stored login:", JSON.parse(existingUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<PlanitLayout />}>
          <Route path="/" element={<WeekPlanner />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/user" element={<UserPanel />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
