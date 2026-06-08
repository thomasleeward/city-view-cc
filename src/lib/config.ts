export const siteConfig = {
  name: "City View Community Church",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cityviewcc.com",
  description:
    "Helping people discover their purpose and live on mission in Santee, CA.",
  address: {
    line1: "9320 Willowgrove Ave",
    city: "Santee",
    state: "CA",
    postalCode: "92071",
  },
  serviceTimes: "Sundays at 8:30AM + 10:30AM",
  email: "hello@cityviewcc.com",
  social: {
    facebook: "https://www.facebook.com/cityviewcc/",
    instagram: "https://www.instagram.com/cityview_cc/",
    youtube: "https://www.youtube.com/channel/UC_laGKyf5lPLF-wOklhGLNw",
  },
  external: {
    giving:
      process.env.NEXT_PUBLIC_GIVING_URL ??
      "https://app.securegive.com/cityviewcc",
    events: process.env.NEXT_PUBLIC_EVENTS_URL ?? "",
    prayerRequest: process.env.NEXT_PUBLIC_PRAYER_FORM_URL ?? "",
    contact: process.env.NEXT_PUBLIC_CONTACT_FORM_URL ?? "",
    connect: process.env.NEXT_PUBLIC_CONNECT_FORM_URL ?? "",
  },
};

// TODO: Replace these URL placeholders when Planning Center API/form access is available.
export const planningCenterTodos = {
  eventsApi: "NEXT_PUBLIC_EVENTS_URL or future Planning Center Events API route",
  prayerForm: "NEXT_PUBLIC_PRAYER_FORM_URL",
  contactForm: "NEXT_PUBLIC_CONTACT_FORM_URL",
  connectForm: "NEXT_PUBLIC_CONNECT_FORM_URL",
};
