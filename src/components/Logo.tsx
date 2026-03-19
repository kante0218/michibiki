/**
 * Michibiki 導 Logo Component
 * Uses the custom-designed brush calligraphy logo image (blue→purple gradient)
 * logo.png = with みちびき text, logo-icon.png = kanji only
 */

type LogoSize = "header" | "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  /** Show "Michibiki" brand name beside the logo */
  showBrandName?: boolean;
  /** Use kanji-only version (no みちびき text) */
  iconOnly?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

const sizeConfig: Record<LogoSize, { imgSize: string; brandImg: string; overlap: string }> = {
  header: { imgSize: "h-10", brandImg: "h-5", overlap: "ml-1.5" },
  xs: { imgSize: "h-12", brandImg: "h-6", overlap: "ml-2" },
  sm: { imgSize: "h-16", brandImg: "h-7", overlap: "ml-2" },
  md: { imgSize: "h-20", brandImg: "h-9", overlap: "ml-3" },
  lg: { imgSize: "h-24", brandImg: "h-10", overlap: "ml-3" },
  xl: { imgSize: "h-32", brandImg: "h-14", overlap: "ml-4" },
};

export default function Logo({
  size = "md",
  showBrandName = false,
  iconOnly = false,
  className = "",
}: LogoProps) {
  const config = sizeConfig[size];
  const src = iconOnly ? "/logo-icon.png" : "/logo.png";

  const gpuStyle = { transform: "translateZ(0)", backfaceVisibility: "hidden" as const, WebkitBackfaceVisibility: "hidden" as const };

  const imgElement = (
    <img
      src={src}
      alt="Michibiki 導"
      className={`${config.imgSize} w-auto object-contain`}
      style={gpuStyle}
    />
  );

  if (showBrandName) {
    return (
      <div className={`flex items-center gap-0 ${className}`} style={gpuStyle}>
        {imgElement}
        <img
          src="/logo-brand.png"
          alt="みちびき"
          className={`${config.brandImg} w-auto object-contain ${config.overlap}`}
          style={gpuStyle}
        />
      </div>
    );
  }

  return <div className={className} style={gpuStyle}>{imgElement}</div>;
}

/** Variant for dark backgrounds (landing page header, footer) */
export function LogoDark({
  size = "sm",
  showBrandName = false,
  iconOnly = false,
  className = "",
}: LogoProps) {
  const config = sizeConfig[size];
  const src = iconOnly ? "/logo-icon.png" : "/logo.png";

  const gpuStyle = { transform: "translateZ(0)", backfaceVisibility: "hidden" as const, WebkitBackfaceVisibility: "hidden" as const };

  const imgElement = (
    <img
      src={src}
      alt="Michibiki 導"
      className={`${config.imgSize} w-auto object-contain`}
      style={gpuStyle}
    />
  );

  if (showBrandName) {
    return (
      <div className={`flex items-center gap-0 ${className}`} style={gpuStyle}>
        {imgElement}
        <img
          src="/logo-brand.png"
          alt="みちびき"
          className={`${config.brandImg} w-auto object-contain brightness-0 invert ${config.overlap}`}
          style={gpuStyle}
        />
      </div>
    );
  }

  return <div className={className} style={gpuStyle}>{imgElement}</div>;
}
