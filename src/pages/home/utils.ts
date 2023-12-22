import L, { LatLngBoundsExpression } from "leaflet";
import { apiUrl, internalAppUrl, spectrumServerUrl } from "./env";

import * as Effect from "@effect/io/Effect";

import * as E from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as S from "@effect/data/String";

import * as Http from "http-kit";
import * as HttpRes from "http-kit/response";

import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { DataLayer } from "@/core/models/data-layer";
import { getAuthentication } from "@/core/services/authentication";
import { createFeatureService } from "@/core/tags/spectrum";
import { LatLng } from "@/core/types/misc";
import { json } from "http-kit/body";
import { RouteResponse, Tab } from "./types";

export const isOnInternalUrl = window.location.href === internalAppUrl;

export function isInternalUser() {
  //if (import.meta.env.DEV) return true;

  const auth = pipe(
    getAuthentication(),
    Effect.provideLayer(SessionStorageLive),
    Effect.either,
    Effect.runSync,
  );

  return E.isRight(auth) || (isOnInternalUrl && E.isRight(auth));
}

// Zoom value to keep the entire boundary of Nigeria inview, excluding other countries
export const defaultZoom = 6.5;

export const defaultCenter = { lat: 9.1715156, lng: 4.0128317 };

// Bounds representing Nigeria
export const maxMapViewBounds: LatLngBoundsExpression = [
  [4, 2.5],
  [14, 15],
];

const markerIcon = L.icon({
  iconSize: [40, 50],
  // iconAnchor: [20, 50],
  // popupAnchor: [0, -50],
  iconUrl: "/marker.png",
});

export const markerProps = {
  autoPan: true,
  draggable: true,
  icon: markerIcon,
};

export const drawOptions = {
  circle: true,
  marker: false,
  polygon: true,
  polyline: false,
  rectangle: false,
  circlemarker: false,
};

export const featureServiceUrl = `${spectrumServerUrl}/rest/Spatial/FeatureService`;

export const tileService = `${spectrumServerUrl}/rest/Spatial/MapTilingService`;

export const mappingService = `${spectrumServerUrl}/rest/Spatial/MappingService`;

// export const storesMapName = "/COVERAGES/NamedMaps/MTNN Walk-in Shops";

export const layerURL = `${apiUrl}/home/layer-tile`;

export function getFeatureService() {
  return createFeatureService(featureServiceUrl);
}

export function createStoreIcon(color = /* MTN Yellow */ "#FFC403") {
  return L.divIcon({
    className: "",
    iconSize: [24, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    html: /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="33" viewBox="0 0 48 43" fill="none">
      <g filter="url(#a)">
        <mask id="b" fill="#fff">
          <path d="m37.336 12.677-3.055-4.96A1.501 1.501 0 0 0 33.008 7H13.99c-.517 0-1.002.273-1.274.716l-3.059 4.96c-1.578 2.56-.181 6.12 2.766 6.53a4.621 4.621 0 0 0 4.12-1.542 4.621 4.621 0 0 0 3.476 1.586 4.621 4.621 0 0 0 3.475-1.586 4.621 4.621 0 0 0 3.475 1.586 4.613 4.613 0 0 0 3.475-1.586c.853.963 2.084 1.586 3.475 1.586.219 0 .432-.016.645-.044 2.958-.404 4.36-3.965 2.777-6.53h-.005Zm-2.644 8.454h-4.798l-13.35-.191H11.56V31.5c0 1.93 1.53 3.5 3.411 3.5h17.056c1.881 0 3.411-1.57 3.411-3.5l.213-10.369h-.96Z" />
        </mask>

        <path fill="${color}" d="m37.336 12.677-3.055-4.96A1.501 1.501 0 0 0 33.008 7H13.99c-.517 0-1.002.273-1.274.716l-3.059 4.96c-1.578 2.56-.181 6.12 2.766 6.53a4.621 4.621 0 0 0 4.12-1.542 4.621 4.621 0 0 0 3.476 1.586 4.621 4.621 0 0 0 3.475-1.586 4.621 4.621 0 0 0 3.475 1.586 4.613 4.613 0 0 0 3.475-1.586c.853.963 2.084 1.586 3.475 1.586.219 0 .432-.016.645-.044 2.958-.404 4.36-3.965 2.777-6.53h-.005Zm-2.644 8.454h-4.798l-13.35-.191H11.56V31.5c0 1.93 1.53 3.5 3.411 3.5h17.056c1.881 0 3.411-1.57 3.411-3.5l.213-10.369h-.96Z" />

        <path fill="#000" d="m37.336 12.677-1.704 1.048.586.952h1.117v-2Zm-3.055-4.96-1.704 1.045.001.003 1.703-1.049Zm-21.564 0 1.702 1.05.002-.005-1.704-1.046Zm-3.06 4.96-1.702-1.05 1.702 1.05Zm2.766 6.53-.275 1.98.01.002.01.001.255-1.984Zm4.12-1.543 1.502-1.322-1.502-1.704-1.5 1.704 1.5 1.322Zm6.95 0 1.502-1.322-1.501-1.704-1.501 1.704 1.5 1.322Zm6.95 0 1.498-1.326-1.502-1.695-1.496 1.7 1.5 1.321Zm4.12 1.542.255 1.984.009-.001.008-.001-.271-1.982Zm2.778-6.53 1.702-1.05-.586-.95H37.34v2Zm-7.446 8.455-.029 2H29.895v-2Zm-13.352-.191.03-2h-.03v2Zm-4.983 0v-2h-2v2h2Zm0 10.56h-2 2Zm23.878 0-2-.041v.041h2Zm.213-10.369 2 .042.042-2.041H35.65v2Zm3.387-9.503-3.053-4.96-3.407 2.097 3.054 4.96 3.407-2.097ZM35.986 6.67A3.501 3.501 0 0 0 33.008 5v4a.499.499 0 0 1-.431-.238l3.409-2.092ZM33.008 5H13.99v4h19.018V5ZM13.99 5c-1.22 0-2.346.64-2.978 1.67l3.41 2.092A.499.499 0 0 1 13.99 9V5Zm-2.976 1.666-3.06 4.96 3.405 2.1 3.06-4.96-3.405-2.1Zm-3.06 4.961c-2.208 3.583-.416 8.919 4.194 9.56l.551-3.962c-1.286-.179-2.286-1.963-1.34-3.499l-3.404-2.099Zm4.215 9.563c.281.036.586.06.9.06v-4c-.114 0-.246-.009-.391-.027l-.51 3.967Zm.9.06a6.622 6.622 0 0 0 4.975-2.264l-3.002-2.644a2.621 2.621 0 0 1-1.974.908v4Zm1.973-2.264a6.622 6.622 0 0 0 4.976 2.264v-4a2.621 2.621 0 0 1-1.974-.908l-3.002 2.644Zm4.976 2.264a6.622 6.622 0 0 0 4.977-2.264l-3.002-2.644a2.622 2.622 0 0 1-1.974.908v4Zm1.975-2.264a6.621 6.621 0 0 0 4.976 2.264v-4a2.621 2.621 0 0 1-1.974-.908l-3.002 2.644Zm4.976 2.264a6.613 6.613 0 0 0 4.976-2.264l-3.002-2.644a2.613 2.613 0 0 1-1.974.908v4Zm1.978-2.26c1.2 1.356 2.962 2.26 4.972 2.26v-4c-.773 0-1.473-.343-1.978-.912l-2.994 2.652Zm4.972 2.26c.32 0 .619-.024.9-.06l-.51-3.968a3.06 3.06 0 0 1-.39.028v4Zm.916-.062c4.621-.632 6.424-5.97 4.208-9.562l-3.404 2.101c.95 1.538-.051 3.32-1.346 3.498l.542 3.963Zm2.506-10.511h-.005v4h.005v-4Zm-2.65 8.454H33.92v4H34.692v-4Zm-.772 0H31.814v4H33.919v-4Zm-2.105 0h-1.92v4h1.92v-4Zm-1.89 0-13.352-.191-.057 4 13.351.191.058-4Zm-13.38-.191h-1.68v4h1.68v-4Zm-1.68 0H13.069v4H14.864v-4Zm-1.796 0H12.205v4H13.068v-4Zm-.863 0H12.2v4h.005v-4Zm-.005 0H11.56v4H12.2v-4Zm-2.64 2V31.5h4V20.94h-4Zm0 10.56c0 2.986 2.377 5.5 5.411 5.5v-4c-.729 0-1.411-.625-1.411-1.5h-4ZM14.97 37h17.056v-4H14.97v4Zm17.056 0c3.034 0 5.411-2.514 5.411-5.5h-4c0 .875-.682 1.5-1.411 1.5v4Zm5.41-5.459.214-10.368-4-.083-.213 10.369 4 .082Zm-1.786-12.41H34.692v4H35.65v-4Z" mask="url(#b)" />
      </g>

      <defs>
        <filter id="a" width="37" height="36" x="5" y="5" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.294118 0 0 0 0 0.294118 0 0 0 0 0.294118 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1569_11770" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_1569_11770" result="shape" />
        </filter>
      </defs>
    </svg>
    `,
  });
}

export function groupLayerAttributesByCategory(layer: DataLayer) {
  type Attr = DataLayer["attributes"][number];

  return layer.attributes.reduce(
    (acc, layer) => {
      const existing = acc[layer.category] ?? [];
      acc[layer.category] = [...existing, layer];
      return acc;
    },
    {} as Record<Attr["category"], Array<Attr>>,
  );
}

export const scalesByZoomLevel: Record<number, string> = {
  0: "1 : 500,000,000",
  1: "1 : 250,000,000",
  2: "1 : 150,000,000",
  3: "1 : 70,000,000",
  4: "1 : 35,000,000",
  5: "1 : 15,000,000",
  6: "1 : 10,000,000",
  7: "1 : 4,000,000",
  8: "1 : 2,000,000",
  9: "1 : 1,000,000",
  10: "1 : 500,000",
  11: "1 : 250,000",
  12: "1 : 150,000",
  13: "1 : 70,000",
  14: "1 : 35,000",
  15: "1 : 15,000",
  16: "1 : 8,000",
  17: "1 : 4,000",
  18: "1 : 2,000",
  19: "1 : 1,000",
};

export function stringToNumber(str: string | null) {
  const val =
    typeof str === "string" && str.trim() !== ""
      ? Number(str)
      : typeof str === "number"
      ? str
      : null;

  return val !== null && Number.isNaN(val) ? null : val;
}

export enum GeolocationPositionErrorCode {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3
}

export function getCurrentPosition() {
  return Effect.async<never, GeolocationPositionError, GeolocationPosition>(
    (resume) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resume(Effect.succeed(position)),
        (error) => resume(Effect.fail(error)),
      );
    },
  );
}

export function getTab(str: string | null) {
  return pipe(
    O.fromNullable(str),
    O.filter(S.isNonEmpty),
    O.filter((_) => _ == Tab.stores || _ == Tab.branches),
    O.getOrElse(() => Tab.stores),
  );
}

export function toNumber(n: string | null) {
  return pipe(
    O.fromNullable(n),
    O.map(parseFloat),
    O.filter((_) => !Number.isNaN(_)),
  );
}

export function parseLatLng(str: string | null) {
  return pipe(
    O.fromNullable(str),
    O.map(S.split(",")),
    O.map(([lat, lng]) => ({ lat: toNumber(lat), lng: toNumber(lng) })),
    O.flatMap(O.all),
  );
}

export function computeRoute(param: {
  to: LatLng;
  from: LatLng;
  apiKey: string;
  routeMask: Readonly<Array<"duration" | "polyline" | "distanceMeters">>;
}) {
  const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

  const masks = param.routeMask.map((mask) => `routes.${mask}`);

  const data = json({
    travelMode: "DRIVE",
    polylineEncoding: "GEO_JSON_LINESTRING",
    // computeAlternativeRoutes: false,
    routingPreference: "TRAFFIC_AWARE",
    origin: {
      location: {
        latLng: {
          latitude: param.from.lat,
          longitude: param.from.lng,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: param.to.lat,
          longitude: param.to.lng,
        },
      },
    },
  });

  return pipe(
    Http.post(url, data, {
      headers: {
        "X-Goog-Api-Key": param.apiKey,
        "X-Goog-FieldMask": masks.join(","),
      },
    }),
    HttpRes.filterStatusOk(),
    HttpRes.toJson<RouteResponse>(),
  );
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

// const coverageSignalScale: Record<CoverageSignal["signalClass"], number> = {
//   LOW: 0,
//   MODERATE: 1,
//   GOOD: 2,
//   EXCELLENT: 3,
// };

// export function sortCoverageSignals(signals: Array<CoverageSignal>) {
//   return signals.sort(
//     (a, b) =>
//       coverageSignalScale[a.signalClass] - coverageSignalScale[b.signalClass],
//   );
// }
