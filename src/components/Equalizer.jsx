export default function Equalizer({ live = false }) {
  return (
    <span className={`eq ${live ? "eq-live" : ""}`} aria-hidden="true">
      <span /><span /><span />
    </span>
  );
}
