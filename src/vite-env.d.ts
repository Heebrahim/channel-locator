/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL: string;

  readonly VITE_PUBLIC_GOOGLE_MAPS_API_KEY: string;

  readonly VITE_PUBLIC_SPECTRUM_PASSWORD: string;

  readonly VITE_PUBLIC_SPECTRUM_SERVER_URL: string;

  readonly VITE_PUBLIC_SPECTRUM_SERVER_URL: string;

  readonly VITE_PUBLIC_MTN_ESHOP_URL: string;

  readonly VITE_PUBLIC_MTN_APPOINTMENT_BOOKING_URL: string;

  readonly VITE_INTERNAL_APP_HOSTNAME: string;

  readonly VITE_HELP_DOC: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
