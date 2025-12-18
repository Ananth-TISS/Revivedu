import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ActivityGenerator from "./pages/ActivityGenerator";
import ActivityDetail from "./pages/ActivityDetail";
import ActivityLibrary from "./pages/ActivityLibrary";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<ActivityGenerator />} />
          <Route path="/library" element={<ActivityLibrary />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;