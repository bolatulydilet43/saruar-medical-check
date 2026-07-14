// Per-client branding. Override via .env (see .env.example) — a new client deployment
// should only need a new .env + a new /public/logo.png, no code changes.
// Note: colors (the green theme) are still hardcoded across pages, not covered here —
// making those themeable per client is a separate, bigger refactor.
export const brand = {
  shortName: import.meta.env.VITE_BRAND_SHORT_NAME || 'Saruar',
  fullName: import.meta.env.VITE_BRAND_FULL_NAME || 'Saruar Medical Check',
  tagline: import.meta.env.VITE_BRAND_TAGLINE || 'Санаторно-курортный медицинский центр',
  address: import.meta.env.VITE_BRAND_ADDRESS || 'Түркістан обл., Сарыағаш ауданы, Коктерек кенті, көш. Ы. Алтынсарин 33',
  addressRu: import.meta.env.VITE_BRAND_ADDRESS_RU || 'Туркестанская обл., Сарыагашский район, п. Коктерек, ул. Ы.Алтынсарина 33',
  phones: import.meta.env.VITE_BRAND_PHONES || 'Тел.: +7 (725) 375-13-02 · Моб.: +7 (701) 038-15-15 (бронирование номеров)',
  contacts: import.meta.env.VITE_BRAND_CONTACTS || 'instagram: saruar_saryagash · e-mail: sansaruar@gmail.com',
};
