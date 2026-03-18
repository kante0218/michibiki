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

const sizeConfig: Record<LogoSize, { imgSize: string; brandImg: string; overlap: string }> = {
  xs: { imgSize: "h-14", brandImg: "h-32", overlap: "-ml-11" },
  sm: { imgSize: "h-20", brandImg: "h-44", overlap: "-ml-14" },
  md: { imgSize: "h-24", brandImg: "h-52", overlap: "-ml-16" },
  lg: { imgSize: "h-28", brandImg: "h-60", overlap: "-ml-20" },
  xl: { imgSize: "h-36", brandImg: "h-72", overlap: "-ml-24" },
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
      className={`${config.imgSize} w-auto object-contain relative z-10 mix-blend-multiply`}
    />
  );

  if (showBrandName) {
    return (
      <div className={`flex items-center gap-0 ${className}`}>
        {imgElement}
        <img
          src="/logo-brand.png"
          alt="みちびき"
          className={`${config.brandImg} w-auto object-contain ${config.overlap} relative z-0 mix-blend-multiply`}
        />
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
      className={`${config.imgSize} w-auto object-contain relative z-10`}
    />
  );

  if (showBrandName) {
    return (
      <div className={`flex items-center gap-0 ${className}`}>
        {imgElement}
        <img
          src="/logo-brand.png"
          alt="みちびき"
          className={`${config.brandImg} w-auto object-contain brightness-0 invert ${config.overlap} relative z-0`}
        />
      </div>
    );
  }

  return <div className={className}>{imgElement}</div>;
}
