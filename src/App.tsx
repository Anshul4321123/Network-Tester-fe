// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";
import Info from "./pages/Info";
import DevMessage from "./pages/DevMessage";
import Navbar from "./components/Navbar";

// Growth Pages
import WhyIsMyInternetSlow from "./pages/growth/WhyIsMyInternetSlow";
import FixHighPing from "./pages/growth/FixHighPing";
import ImproveWifiSignal from "./pages/growth/ImproveWifiSignal";
import InternetSpeedForGaming from "./pages/growth/InternetSpeedForGaming";
import WhatIsGoodInternetSpeed from "./pages/growth/WhatIsGoodInternetSpeed";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/info" element={<Info />} />
        <Route path="/dev-message" element={<DevMessage />} />
        
        {/* Growth Pages - SEO */}
        <Route path="/why-is-my-internet-slow" element={<WhyIsMyInternetSlow />} />
        <Route path="/fix-high-ping" element={<FixHighPing />} />
        <Route path="/improve-wifi-signal" element={<ImproveWifiSignal />} />
        <Route path="/internet-speed-for-gaming" element={<InternetSpeedForGaming />} />
        <Route path="/what-is-good-internet-speed" element={<WhatIsGoodInternetSpeed />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;