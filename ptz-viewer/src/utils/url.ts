export const reload = () => window.location.reload();

export const frontendPath = (p: string) =>
  process.env.PUBLIC_URL
    ? `${process.env.PUBLIC_URL}/${p.startsWith("/") ? p.slice(1) : p}`
    : p;
