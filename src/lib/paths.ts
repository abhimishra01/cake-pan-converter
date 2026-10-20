// Links that work from the domain root and from a sub path (GitHub Pages serves the site at /<slug>/).
const base: string = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const url = (path: string) => base + path.replace(/^\//, '');
// Path without the base, for example "/about/". Used for canonical links and the current-page check.
export const stripBase = (pathname: string) => (pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname);
