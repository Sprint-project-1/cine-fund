export default function SkeletonBlock({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded bg-[#e9edf2] motion-reduce:animate-none ${className}`}
    />
  );
}
