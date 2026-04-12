import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";
import Info from "./pages/Info";
import DevMessage from "./pages/DevMessage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/info" element={<Info />} />
        <Route path="/dev-message" element={<DevMessage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;