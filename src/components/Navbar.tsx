import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px",
      background: "#111",
      color: "#fff"
    }}>
      <h3>SpeedTest</h3>

      <div>
        <Link to="/" style={{ marginRight: "20px", color: "#fff" }}>
          Home
        </Link>

        <Link to="/history" style={{ color: "#fff" }}>
          History
        </Link>
      </div>
    </div>
  );
}