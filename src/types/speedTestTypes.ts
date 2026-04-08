export type TestPhase =
  | "idle"
  | "ping"
  | "download"
  | "upload"
  | "analyzing"
  | "complete";