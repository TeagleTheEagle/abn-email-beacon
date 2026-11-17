// Forms, account screens and demos keep their own controls; all other public pages share one bar.
const EXCLUDED_PATHS = ["/contact", "/book", "/auth", "/reset-password", "/account"];
const EXCLUDED_PREFIXES = ["/demo/", "/demos", "/preview/", "/design-system"];

export function hasMobileActionBar(pathname: string): boolean {
  return (
    !EXCLUDED_PATHS.includes(pathname) &&
    !EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}
