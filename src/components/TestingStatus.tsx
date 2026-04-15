// components/TestingStatus.tsx
interface TestingStatusProps {
  phase: string;
  isTestActive: boolean;
}

const getPhaseText = (phase: string) => {
  switch (phase) {
    case "ping": return "📡 Testing Ping...";
    case "download": return "⬇️ Testing Download Speed...";
    case "upload": return "⬆️ Testing Upload Speed...";
    case "analyzing": return "🔍 Analyzing Results...";
    case "complete": return "✅ Test Complete!";
    default: return "";
  }
};

export default function TestingStatus({ phase, isTestActive }: TestingStatusProps) {
  if (!isTestActive) return null;
  
  return (
    <div
      style={{
        fontSize: "clamp(13px, 3.5vw, 15px)",
        fontWeight: "500",
        marginBottom: "16px",
        color: "#3b82f6",
      }}
    >
      {getPhaseText(phase)}
    </div>
  );
}