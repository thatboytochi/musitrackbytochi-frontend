export default function Vinyl({ spinning = false, size = "h-28 w-28", art }) {
  return (
    <div className={`relative shrink-0 ${size}`} aria-hidden="true">
      <div className={`vinyl h-full w-full ${spinning ? "vinyl-spin" : ""}`} />
      {art && (
        <img src={art} alt="" className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover" />
      )}
    </div>
  );
}
