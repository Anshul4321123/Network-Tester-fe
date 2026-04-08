interface Props {
  onClick: () => void
}

export default function StartTestButton({ onClick }: Props) {

  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        marginTop: "20px",
        cursor: "pointer",
      }}
    >
      Start Test
    </button>
  );

}