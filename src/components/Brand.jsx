// Header lockup: icon mark from the official logo + live wordmark text.
export default function Brand({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/logo-mark.png" alt="" className="h-10 w-auto" />
      <div className="leading-none">
        <p className="text-xl font-semibold tracking-tight">MusiTrack</p>
        <p className="mt-1 text-[11px] font-light tracking-[0.35em] text-snow/70">By Tochi</p>
      </div>
    </div>
  );
}
