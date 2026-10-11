export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand-mark brand-mark--compact" : "brand-mark"} aria-label="Kota Bandung">
      <span className="brand-mark__center" />
      <span className="brand-mark__arm brand-mark__arm--top" />
      <span className="brand-mark__arm brand-mark__arm--right" />
      <span className="brand-mark__arm brand-mark__arm--bottom" />
      <span className="brand-mark__arm brand-mark__arm--left" />
    </div>
  );
}
