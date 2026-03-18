/**
 * Michibiki 導 Logo Component
 * Uses the custom-designed brush calligraphy logo image (blue→purple gradient)
 * logo.png = with みちびき text, logo-icon.png = kanji only
 */

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  /** Show "Michibiki" brand name beside the logo */
  showBrandName?: boolean;
  /** Use kanji-only version (no みちびき text) */
  iconOnly?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

const sizeConfig: Record<LogoSize, { imgSize: string; brandText: string }> = {
  xs: { imgSize: "h-11", brandText: "text-sm" },
  sm: { imgSize: "h-14", brandText: "text-lg" },
  md: { imgSize: "h-16", brandText: "text-lg" },
  lg: { imgSize: "h-20", brandText: "text-xl" },
  xl: { imgSize: "h-28", brandText: "text-2xl" },
};

export default function Logo({
  size = "md",
  showBrandName = false,
  iconOnly = false,
  className = "",
}: LogoProps) {
  const config = sizeConfig[size];
  const src = iconOnly ? "/logo-icon.png" : "/logo.png";

  const imgElement = (
    <img
      src={src}
      alt="Michibiki 導"
      className={`${config.imgSize} w-auto object-contain`}
    />
  );

  if (showBrandName) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {imgElement}
        <span className={`font-bold text-gray-900 ${config.brandText} tracking-tight`}>
          みちびき
        </span>
      </div>
    );
  }

  return <div className={className}>{imgElement}</div>;
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

  const imgElement = (
    <img
      src={src}
      alt="Michibiki 導"
      className={`${config.imgSize} w-auto object-contain`}
    />
  );

  if (showBrandName) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {imgElement}
        <span className={`text-white font-bold ${config.brandText}`}>
          みちびき
        </span>
      </div>
    );
  }

  return <div className={className}>{imgElement}</div>;
}
