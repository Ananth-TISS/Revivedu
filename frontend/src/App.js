import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import ActivityGenerator from "./pages/ActivityGenerator";
import ActivityDetail from "./pages/ActivityDetail";
import ActivityLibrary from "./pages/ActivityLibrary";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import ExposureReport from "./pages/dashboard/ExposureReport";
import Guide from "./pages/Guide";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/generate" element={<ActivityGenerator />} />
            <Route path="/library" element={<ActivityLibrary />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/report/:childId" element={<ExposureReport />} />
            <Route path="/guide" element={<Guide />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </AuthProvider>
  );
}

export default App;