// Lock & Loft logo. variant: 'dark' = for dark backgrounds (ivory text), 'light' = for light backgrounds.
// icon: only the arch mark. Size it with a Tailwind height class, e.g. className="h-10 w-auto".
/* eslint-disable @next/next/no-img-element */
export default function Logo({ variant = 'dark', icon = false, className = 'h-10 w-auto', alt = 'Lock & Loft' }) {
  return <img src={`/brand/${icon ? 'icon' : 'logo'}-${variant}.svg`} alt={alt} className={className} style={{ backgroundColor: 'transparent' }} />;
}
