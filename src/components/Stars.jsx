/**
 * Stars — renders a star rating with half-star support.
 * @param {number} rating  - e.g. 4.7
 * @param {number} [size]  - font-size in px (default 14)
 */
export default function Stars({ rating, size = 14 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span style={{ fontSize: size, letterSpacing: 1, color: "var(--amber)", lineHeight: 1 }}>
      {"★".repeat(full)}
      {half && "½"}
      <span style={{ color: "var(--text-disabled)" }}>{"★".repeat(empty)}</span>
    </span>
  );
}
