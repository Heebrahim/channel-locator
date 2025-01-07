import "./global.css";

import "leaflet/dist/leaflet.css";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import "leaflet-draw/dist/leaflet.draw.css";

import * as L from "leaflet";

import "leaflet-active-area";

import "leaflet-spectrum-spatial";

import Tour from "reactour";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Libraries, useJsApiLoader } from "@react-google-maps/api";

import {
  FeatureGroup,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  Tooltip,
  WMSTileLayer,
  ZoomControl,
} from "react-leaflet";

import MarkerClusterGroup from "react-leaflet-cluster";

import { EditControl } from "react-leaflet-draw";

import {
  bankIcons,
  computeRoute,
  createATMIcon,
  createBankIcon,
  createBranchIcon,
  createPOSIcon,
  defaultCenter,
  defaultZoom,
  formatAddress,
  GeolocationPositionErrorCode,
  getCurrentPosition,
  getFeatureService,
  getTab,
  groupLayerAttributesByCategory,
  isInternalUser,
  layerURL,
  markerProps,
  maxMapViewBounds,
  nonNullable,
  parseLatLng,
  scalesByZoomLevel,
  stringToNumber,
} from "./utils";

import * as E from "@effect/data/Either";
import {
  constFalse,
  constNull,
  flow,
  identity,
  pipe,
} from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as A from "@effect/data/ReadonlyArray";
import * as S from "@effect/data/String";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import {
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router-dom";

import clsx from "clsx";

import { BiLocationPlus, BiUserCircle } from "react-icons/bi";
import { FaDownload } from "react-icons/fa";

import {
  IoHelp,
  IoStorefront,
  IoAdd,
  IoRemove,
} from "react-icons/io5";

import {
  Box,
  Button,
  Center,
  Checkbox,
  Collapse,
  Divider,
  Icon,
  Spinner,
  useToast,
} from "@chakra-ui/react";

import styles from "./style.module.css";

import { DataLayer } from "@/core/models/data-layer";
import { DataLayerControl } from "./components/controls/data-layer";
import { DistanceBetween } from "./components/distance";
import { DrawEvent, SearchType, Tab } from "./types";

import { helpDoc } from "./env";

// @ts-expect-error
import jsurl from "jsurl";

// @ts-expect-error
import { useMediaQuery } from "@uidotdev/usehooks";

import { HttpClientLive } from "@/common/http-client";
import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { DataLayerRepositoryLive } from "@/core/repository/data-layer/implementation";
import { BranchRepositoryLive } from "@/core/repository/branch/implementation";

import { Variant } from "@/core/repository/branch/contract";
import { invalidate } from "@/core/services/authentication";
import { findForLayerAt } from "@/core/services/data-layer";
import { LatLng } from "@/core/types/misc";
import { useQuery } from "@tanstack/react-query";
import { FeatureCollection } from "geojson";
import { StreetView } from "./components/streetview";
import { updateURLSearchWithoutNavigation } from "./hooks/use-update-url-search-without-navigation";
import { loader } from "./loader";

import { About } from "./components/about";

import { motion } from "framer-motion";
import { Direction } from "./components/direction";

import * as DataLayerService from "@/core/services/data-layer";
import * as BranchService from "@/core/services/branch";

import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";

import { AttributeSummary } from "./components/attribute-summary";
import { Search } from "./components/search";
import { SidebarToggle } from "./components/sidebar-toggle";
import { getAuth } from "@/common/authUtil";
import { DataLayerControlForAreaName } from "./components/controls/data-layer/areaname";
import { DefaultZommControl } from "./components/controls/data-layer/defaultzoom";

const googleMapsApiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

const googleMapsLibraries: Libraries = ["places"];

function Loader() {
  return (
    <div className="h-full flex p-4">
      <Spinner className="m-auto" size="sm" />
    </div>
  );
}

function LoadError() {
  return (
    <div className="h-full flex">
      <div className="m-auto flex flex-col items-center justify-center space-y-2">
        <p className="text-center">An error occurred.</p>

        <Button
          size="sm"
          className="w-fit"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    </div>
  );
}

function convertToCSV(data: FeatureCollection) {
  const csvRows = [];
  const allAttributes = new Set();

  for (const geojson of Object.values(data)) {
    const { features } = geojson;
    // @ts-expect-error
    features.forEach((feature) => {
      Object.keys(feature.properties).forEach((attr) => {
        if (attr !== "MI_Style") {
          allAttributes.add(attr);
        }
      });
    });
  }

  const attributes = Array.from(allAttributes).sort();
  csvRows.push(["Layer", ...attributes].join(","));

  for (const [layerKey, geojson] of Object.entries(data)) {
    const { features } = geojson;
    // @ts-expect-error
    features.forEach((feature) => {
      const row = [layerKey];
      attributes.forEach((attr) => {
        // @ts-expect-error
        row.push(feature.properties[attr] || "");
      });
      csvRows.push(row.join(","));
    });
  }

  return csvRows.join("\n");
}

function downloadCSV(data: FeatureCollection) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", "data.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const dataLayerEffectLayer = Layer.mergeAll(
  SessionStorageLive,
  DataLayerRepositoryLive.pipe(
    Layer.use(HttpClientLive),
    Layer.use(getFeatureService())
  )
);

const branchesEffectLayer = Layer.mergeAll(
  SessionStorageLive,
  BranchRepositoryLive.pipe(
    Layer.use(HttpClientLive),
    Layer.use(getFeatureService())
  )
);

function useURLSearchParams() {
  const navigation = useNavigation();

  const [search, setSearch] = useSearchParams();

  return [
    useMemo(
      () =>
        navigation.location
          ? new URLSearchParams(navigation.location.search)
          : search,
      [search, navigation.location]
    ),
    setSearch,
  ] as const;
}

function updateBrandColor(bankName: string) {
  const bankColors = {
    FCMB: "#6C2494",
    UBA: "#CC2D11",
    ZENITH: "#7C7E81",
    GTB: "#D74809",
    "PREMIUM TRUST BANK": "#302B2C",
    "STANDARD CHARTERED BANK": "#3ED308",
    OPTIMUS: "#616077",
    "UNITY BANK": "#556473",
    "PARALLEX BANK": "#CFAA72",
    WEMA: "#A1125E",
    ACCESS: "#004087",
    CITIBANK: "#016BBB",
    ECO: "#005377",
    FIDELITY: "#4BBC45",
    "FIRST BANK": "#03456B",
    GLOBUS: "#D72535",
    HERITAGE: "#4DBC41",
    JAIZ: "#095e2a",
    KEYSTONE: "#113D72",
    LOTUS: "#113D72",
    POLARIS: "#8A31AF",
    PROVIDUS: "#E2AD39",
    STERLING: "#D43337",
    SUNTRUST: "#DE7824",
    TAJBANK: "#DD1E12",
    UNION: "#009ADC",
  };
  const root = document.documentElement;
  // @ts-expect-error
  const newColor = bankColors[bankName.toUpperCase()] || "var(--brand)";
  root.style.setProperty("--brand", newColor);
}

export function Home() {
  const loaderData =
    (useLoaderData() as Awaited<ReturnType<typeof loader>>) || null;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries: googleMapsLibraries,
  });

  const showInternalTools = useMemo(() => isInternalUser(), []);

  const navigation = useNavigation();

  const [search, setSearch] = useURLSearchParams();

  const tab = useMemo(() => getTab(search.get("tab")), [search]);
    // @ts-expect-error
  const { lat, lng } = loaderData.latlng ?? defaultCenter;

  const storeType = useMemo(
    () => pipe(O.fromNullable(search.get("type")), O.filter(S.isNonEmpty)),
    [search]
  );

  const [dataVariant, setDataVariant] = useState(() =>
    pipe(
      O.fromNullable(search.get("variant")),
      O.filter(S.isNonEmpty),
      O.getOrElse(() => Variant.branch)
    )
  );

  const [markerLatlng, setLatLng] = useState(() => {
   // @ts-expect-error

    return !loaderData.latlng ? null : new L.LatLng(lat, lng);
  });

  

  const searchType = useMemo(
    () =>
      pipe(O.fromNullable(search.get("searchType")), O.filter(S.isNonEmpty)),
    [search]
  );

  const zoom = stringToNumber(search.get("z")) ?? defaultZoom;


  const branches = useMemo(
    () => O.fromNullable(loaderData.branches),
    [loaderData.branches]
  );

  const competitorQuery = useQuery({
    queryKey: ["competitors"],
    enabled: showInternalTools,
    queryFn() {
    // @ts-expect-error

      return BranchService.getNearestCompetitors(markerLatlng, dataVariant).pipe(
        Effect.provideLayer(branchesEffectLayer),
        Effect.either,
        Effect.runPromise
      );
    },
  });

  const competitors = useMemo(
    () => O.fromNullable(competitorQuery.data),
    [competitorQuery.data]
  );

  const branch = useMemo(
    () => pipe(O.fromNullable(search.get("branch")), O.filter(S.isNonEmpty)),
    [search]
  );

  const selectedBranch = useMemo(() => {
    return pipe(
      O.all({ branch, branches }),
      O.flatMap(({ branches, branch }) => {
        return pipe(
          branches,
          E.mapRight((_) => _.features),
          E.match({
            onLeft: O.none,
            onRight: A.findFirst((_) => _.id == branch),
          })
        );
      })
    );
  }, [branch, branches]);

  const filteredCompetitors = useMemo(() => {
    return pipe(
      competitors,
      O.map(
        E.mapRight((competitors) => {
          return pipe(
            storeType,
            O.match({
              onNone: () => competitors.features,
              onSome: (type) =>
                competitors.features.filter(
                  ({ properties }) => type == properties.type
                ),
            })
          );
        })
      )
    );
  }, [storeType, competitors]);

  const _filteredBranches = useMemo(() => {
    return pipe(
      branches,
      O.map(
        E.mapRight((branches) => {
          return pipe(
            storeType,
            O.match({
              onNone: () => branches.features,
              onSome: (type) =>
                branches.features.filter(
                  ({ properties }) => type == properties.type
                ),
            })
          );
        })
      )
    );
  }, [storeType, branches]);

  const filteredBranches = useMemo(() => {
    return pipe(
      branches,
      O.map(
        E.mapRight((branches) => {
          const filtered = pipe(
            storeType,
            O.match({
              onNone: () => branches.features,
              onSome: (type) =>
                branches.features.filter(
                  ({ properties }) => type == properties.type
                ),
            })
          );

          return filtered.sort((a, b) =>
            a.properties.bank_name.localeCompare(b.properties.bank_name)
          );
        })
      )
    );
  }, [storeType, branches]);

  console.log(filteredBranches, _filteredBranches);
  // const storeTypes = useMemo(() => {
  //   type Groups = Record<
  //     string,
  //     { type: string; color: string; total: number }
  //   >;

  //   return pipe(
  //     branches,
  //     O.flatMap((_) => pipe(_, E.getOrNull, O.fromNullable)),
  //     O.map((_) => _.features),
  //     O.map(
  //       A.reduceRight({} as Groups, (acc, { properties: { type, color } }) => {
  //         const { total = 0 } = acc[type] ?? {};
  //         acc[type] = { type, color, total: total + 1 };
  //         return acc;
  //       })
  //     )
  //   );
  // }, [branches]);

  const toast = useToast();

  const navigate = useNavigate();

  const markerRef = useRef<L.Marker | null>(null);

  const mapRef = useRef<L.Map | null>(null);

  const [map, setMap] = useState<L.Map | null>(null);

  const [showSideBar, setShowSideBar] = useState(true);

  const [showStreetview, setShowStreetview] = useState<LatLng | null>(null);

  const [showIntroModal, setShowIntroModal] = useState(import.meta.env.PROD);
  const [tourStepsEnabled, setTourStepsEnabled] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);



  const [cursor, setCursor] = useState(() => {
    return { lat, lng, z: zoom };
  });

  const [drawnLayer, setDrawnLayer] = useState<L.Layer | null>(null);

  const [selectedDataLayers, setSelectedDataLayers] = useState<
    Array<DataLayer["id"]>
  >(() => {
    return pipe(
      O.fromNullable(search.get("layers")),
      O.filter(S.isNonEmpty),
      O.map((_) => jsurl.parse(_) as number[]),
      O.getOrElse(() => [] as number[])
    );
  });

  const [isSelected, setIsSelected] = useState<null>(null);

  // For some unknown reason, we can't access the actual value of `selectedDataLayers` inside
  // callbacks/functions. So we need this to solve that
  const selectedDataLayersRef = useRef<Array<DataLayer["id"]>>();

  const [baseMapRegistered, setBaseMapRegistered] = useState(false);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const direction = search.get("d");

  const directionTo = parseLatLng(direction);

  const directionQuery = useQuery({
    enabled: !!markerLatlng,
    queryKey: ["direction", markerLatlng?.lat, markerLatlng?.lng, direction],
    queryFn() {
      const program = Effect.gen(function* (_) {
        const from = { lat: markerLatlng!.lat, lng: markerLatlng!.lng };

        const to = yield* _(directionTo);

        const routeMask = ["duration", "distanceMeters", "polyline"] as const;

        const result = yield* _(
          computeRoute({ to, from, routeMask, apiKey: googleMapsApiKey })
        );

        return result.routes.map((route) => {
          const polyline = route.polyline;
          const linestring = polyline.geoJsonLinestring;

          /** Google sends back the coordinates as [longitude, latitude],
           * but leaflet expects it as [latitude, longitude]
           */
          const coordinates = linestring.coordinates.map(
            ([lng, lat]) => [lat, lng] as [latitude: number, longitude: number]
          );

          return {
            ...route,
            polyline: {
              ...polyline,
              geoJsonLinestring: { ...linestring, coordinates },
            },
          } as const;
        });
      });

      return program.pipe(
        Http.provide(Fetch.adapter),
        Effect.either,
        Effect.runPromise
      );
    },
  });

  // @ts-expect-error


  const mergeDataLayers = (dataLayer1, dataLayer2) => ({
    ...dataLayer1,
    ...dataLayer2,
  });

  const loaderDataLayers = useQuery({
    queryKey: ["data-layers"],
    enabled: showInternalTools,
    queryFn() {
      return DataLayerService.getDataLayers().pipe(
        Effect.provideLayer(dataLayerEffectLayer),
        Effect.either,
        Effect.runPromise
      );
    },
  });
 
  const loaderDataLayersForAreaMap = useQuery({
    queryKey: ["data-layers-area-map"],
    enabled: showInternalTools,
    queryFn() {
      return DataLayerService.getAreaMapDataLayers().pipe(
        Effect.provideLayer(dataLayerEffectLayer),
        Effect.either,
        Effect.runPromise
      );
    },
  });

  const loaderDataLayersForCompetitors = useQuery({
    queryKey: ["data-layers-competitors"],
    enabled: showInternalTools,
    queryFn() {
      return DataLayerService.getDataLayersForCompetitors().pipe(
        Effect.provideLayer(dataLayerEffectLayer),
        Effect.either,
        Effect.runPromise
      );
    },
  });

  // const mergedLoaderDataLayers = useQueries([
  //   {
  //     queryKey: ["data-layers"],
  //     enabled: showInternalTools,
  //     queryFn() {
  //       return DataLayerService.getDataLayers().pipe(
  //         Effect.provideLayer(dataLayerEffectLayer),
  //         Effect.either,
  //         Effect.runPromise
  //       );
  //     },
  //   },
  //   {
  //     queryKey: ["data-layers-area-map"],
  //     enabled: showInternalTools,
  //     queryFn() {
  //       return DataLayerService.getAreaMapDataLayers().pipe(
  //         Effect.provideLayer(dataLayerEffectLayer),
  //         Effect.either,
  //         Effect.runPromise
  //       );
  //     },
  //   },
  //   {
  //     queryKey: ["data-layers-competitors"],
  //     enabled: showInternalTools,
  //     queryFn() {
  //       return DataLayerService.getDataLayersForCompetitors().pipe(
  //         Effect.provideLayer(dataLayerEffectLayer),
  //         Effect.either,
  //         Effect.runPromise
  //       );
  //     },
  //   },
  // ]);

  // console.log(mergedLoaderDataLayers, loaderDataLayers)

  // console.log(mergedLoaderDataLayers.right)

  const area = search.get("area");

  const layers = search.get("layers");

  const loaderDataLayersSelection = useQuery({
    refetchInterval: false,
    refetchOnWindowFocus: false,
    queryKey: ["data-layers-selection", area, layers],
    enabled:
      area &&
      layers &&
      !!loaderDataLayers.data &&
      E.isRight(loaderDataLayers.data)
        ? true
        : false,
    queryFn() {
      const program = Effect.gen(function* (_) {
        const _layers = yield* _(
          O.fromNullable(layers),
          O.filter(S.isNonEmpty),
          O.map(S.trim),
          O.map((_) => jsurl.parse(_) as number[]),
          O.filter(A.isNonEmptyArray)
        );

        const _area = yield* _(
          O.fromNullable(area),
          O.filter(S.isNonEmpty),
          O.map(S.trim),
          O.map(jsurl.parse)
        );

        const dataLayers = yield* _(loaderDataLayers.data!);

        const selectedLayers = dataLayers.filter((layer) =>
          _layers.includes(layer.id)
        );

        const region = _area as
          | { type: "circle"; radius: number; latlng: LatLng }
          | { type: "polygon"; geometry: any };

        return yield* _(
          region.type === "circle"
            ? DataLayerService.findForLayersAt(
                selectedLayers,
                region.latlng,
                region.radius
              )
            : DataLayerService.findForLayersWithin(
                selectedLayers,
                region.geometry
              )
        );
      });

      return pipe(
        program,
        Effect.map((_) => _ as Record<number, FeatureCollection>),
        Effect.provideLayer(dataLayerEffectLayer),
        Effect.either,
        Effect.runPromise
      );
    },
  });

  const loaderDataLayersSelectionForAreaMap = useQuery({
    refetchInterval: false,
    refetchOnWindowFocus: false,
    queryKey: ["data-layers-selection-for-areamap", area, layers],
    enabled:
      area &&
      layers &&
      !!loaderDataLayersForAreaMap.data &&
      E.isRight(loaderDataLayersForAreaMap.data)
        ? true
        : false,
    queryFn() {
      const program = Effect.gen(function* (_) {
        const _layers = yield* _(
          O.fromNullable(layers),
          O.filter(S.isNonEmpty),
          O.map(S.trim),
          O.map((_) => jsurl.parse(_) as number[]),
          O.filter(A.isNonEmptyArray)
        );

        const _area = yield* _(
          O.fromNullable(area),
          O.filter(S.isNonEmpty),
          O.map(S.trim),
          O.map(jsurl.parse)
        );

        const dataLayers = yield* _(loaderDataLayersForAreaMap.data!);

        const selectedLayers = dataLayers.filter((layer) =>
          _layers.includes(layer.id)
        );

        const region = _area as
          | { type: "circle"; radius: number; latlng: LatLng }
          | { type: "polygon"; geometry: any };

        return yield* _(
          region.type === "circle"
            ? DataLayerService.findForLayersAt(
                selectedLayers,
                region.latlng,
                region.radius
              )
            : DataLayerService.findForLayersWithin(
                selectedLayers,
                region.geometry
              )
        );
      });

      return pipe(
        program,
        Effect.map((_) => _ as Record<number, FeatureCollection>),
        Effect.provideLayer(dataLayerEffectLayer),
        Effect.either,
        Effect.runPromise
      );
    },
  });

  const loaderDataLayersSelectionForCompetitors = useQuery({
    refetchInterval: false,
    refetchOnWindowFocus: false,
    queryKey: ["data-layers-selection-for-competitors", area, layers],
    enabled:
      area &&
      layers &&
      !!loaderDataLayersForCompetitors.data &&
      E.isRight(loaderDataLayersForCompetitors.data)
        ? true
        : false,
    queryFn() {
      const program = Effect.gen(function* (_) {
        const _layers = yield* _(
          O.fromNullable(layers),
          O.filter(S.isNonEmpty),
          O.map(S.trim),
          O.map((_) => jsurl.parse(_) as number[]),
          O.filter(A.isNonEmptyArray)
        );

        const _area = yield* _(
          O.fromNullable(area),
          O.filter(S.isNonEmpty),
          O.map(S.trim),
          O.map(jsurl.parse)
        );

        const dataLayers = yield* _(loaderDataLayersForCompetitors.data!);

        const selectedLayers = dataLayers.filter((layer) =>
          _layers.includes(layer.id)
        );

        const region = _area as
          | { type: "circle"; radius: number; latlng: LatLng }
          | { type: "polygon"; geometry: any };

        return yield* _(
          region.type === "circle"
            ? DataLayerService.findForLayersAt(
                selectedLayers,
                region.latlng,
                region.radius
              )
            : DataLayerService.findForLayersWithin(
                selectedLayers,
                region.geometry
              )
        );
      });

      return pipe(
        program,
        Effect.map((_) => _ as Record<number, FeatureCollection>),
        Effect.provideLayer(dataLayerEffectLayer),
        Effect.either,
        Effect.runPromise
      );
    },
  });

  const [dataLayerSelectionResult, setDataLayerSelectionResult] = useState(
    () => loaderDataLayersSelection.data
  );

  const [
    dataLayerSelectionResultForCompetitors,
    setDataLayerSelectionResultForCompetitors,
  ] = useState(() => loaderDataLayersSelectionForCompetitors.data);

  const [
    dataLayerSelectionResultForAreaMap,
    setDataLayerSelectionResultForAreaMap,
  ] = useState(() => loaderDataLayersSelectionForAreaMap.data);

  const dataLayers = useMemo(() => {
    return pipe(
      O.fromNullable(loaderDataLayers.data),
      O.map(
        E.mapRight((layers) => layers.sort((a, b) => a.priority - b.priority))
      )
    );
  }, [loaderDataLayers.data]);

  const dataLayersForCompetitors = useMemo(() => {
    return pipe(
      O.fromNullable(loaderDataLayersForCompetitors.data),
      O.map(
        E.mapRight((banks) =>
          banks.sort((a, b) => a.title.localeCompare(b.title))
        )
      )
    );
  }, [loaderDataLayersForCompetitors.data]);

  const dataLayersForAreaMap = useMemo(() => {
    return pipe(
      O.fromNullable(loaderDataLayersForAreaMap.data),
      O.map(
        E.mapRight((layers) => layers.sort((a, b) => a.priority - b.priority))
      )
    );
  }, [loaderDataLayersForAreaMap.data]);

  const dataLayersByID = useMemo(() => {
    return pipe(
      dataLayers,
      O.map(
        E.mapRight(
          flow(
            A?.map((_) => [_.id, _] as const),
            (_) => Object.fromEntries(_)
          )
        )
      )
    );
  }, [dataLayers]);

  const dataLayersByIDForCompetitors = useMemo(() => {
    return pipe(
      dataLayersForCompetitors,
      O.map(
        E.mapRight(
          flow(
            A?.map((_) => [_.id, _] as const),
            (_) => Object.fromEntries(_)
          )
        )
      )
    );
  }, [dataLayersForCompetitors]);

  const dataLayersByIDForAreaMap = useMemo(() => {
    return pipe(
      dataLayersForAreaMap,
      O.map(
        E.mapRight(
          flow(
            A?.map((_) => [_.id, _] as const),
            (_) => Object.fromEntries(_)
          )
        )
      )
    );
  }, [dataLayersForAreaMap]);

  // Joining the data layers ID's
  const _mergedDataLayersByID = useMemo(() => {
    return pipe(
      dataLayersByID,
      O.flatMap(flow(E.getOrNull, O.fromNullable)),
      O.map((_l) =>
        pipe(
          dataLayersByIDForCompetitors,
          O.flatMap(flow(E.getOrNull, O.fromNullable)),
          O.map((_c) => mergeDataLayers(_l, _c))
        )
      ),
      O.flatten,
      O.map((merged) => E.right(merged))
    );
  }, [dataLayersByID, dataLayersByIDForCompetitors]);

  const mergedDataLayersByID = useMemo(() => {
    return pipe(
      _mergedDataLayersByID,
      O.flatMap(flow(E.getOrNull, O.fromNullable)),
      O.map((_l) =>
        pipe(
          dataLayersByIDForAreaMap,
          O.flatMap(flow(E.getOrNull, O.fromNullable)),
          O.map((_c) => mergeDataLayers(_l, _c))
        )
      ),
      O.flatten,
      O.map((merged) => E.right(merged))
    );
  }, [_mergedDataLayersByID, dataLayersByIDForAreaMap]);

  // Where on the map a user clicks with a data layer selected
  const [dataLayerTarget, setDataLayerTarget] = useState<{
    point: LatLng;
    layer: DataLayer;
  } | null>(null);

  const auth = getAuth();
  
  // @ts-expect-error
  const columnName = auth?.right?.organisation?.columnName;
  console.log(columnName);

  const organisationLogo = useMemo(() => {
    // @ts-expect-error

    const svg = bankIcons[columnName];
    return (
      <div className="flex justify-center">
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }}></div> : null}
      </div>
    );
  }, [columnName]);

  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;

        if (marker) {
          const latlng = marker.getLatLng();

          setLatLng(latlng);

          map?.setView(latlng);

          setSearch((search) => {
            search.set("p", `${latlng.lat},${latlng.lng}`);
            search.delete("d");
            return search;
          });
        }
      },
    }),
    [map, setSearch]
  );

  const onSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = new FormData(e.target as HTMLFormElement);

      pipe(
        O.fromNullable(form.get("query")),
        O.map((_) => _.toString()),
        O.flatMap(parseLatLng),
        O.match({
          onNone: () => {},
          onSome: ({ lat, lng }) => {
            const latlng = new L.LatLng(lat, lng);

            setLatLng(latlng);
            map?.flyTo(latlng, 16);

            setSearch((search) => {
              search.set("p", `${lat},${lng}`);
              return search;
            });
          },
        })
      );
    },
    [map, setSearch]
  );

  const onAutocompletePlaceChange = useCallback(
    (loc: google.maps.LatLng) => {
      const lat = loc.lat();
      const lng = loc.lng();

      setSearch((search) => {
        search.set("searchType", SearchType.nearest);
        search.set("p", `${lat},${lng}`);
        search.delete("d");
        return search;
      });

      const latlng = new L.LatLng(lat, lng);
      setLatLng(latlng);

      map?.flyTo(latlng, 16);
    },
    [map, setSearch]
  );

  const onCurrentLocation = useCallback(() => {
    pipe(
      getCurrentPosition(),
      Effect.tap(({ coords }) => {
        return Effect.sync(() => {
          const { latitude, longitude } = coords;

          setSearch((search) => {
            search.set("searchType", SearchType.nearest);
            search.set("p", `${latitude},${longitude}`);
            search.delete("d");

            return search;
          });

          const latlng = new L.LatLng(latitude, longitude);
          setLatLng(latlng);

          map?.flyTo(latlng, 16);
        });
      }),
      Effect.tapError((err) => {
        return Effect.sync(() => {
          const description =
            err.code === GeolocationPositionErrorCode.PERMISSION_DENIED
              ? "Please grant the location permission to search using your location"
              : err.code === GeolocationPositionErrorCode.POSITION_UNAVAILABLE
              ? "Encountered an error with your GPS device"
              : "An error occured while trying to get your current location";

          toast({
            status: "error",
            description: `${err.message}. ${description}`,
          });
        });
      }),
      Effect.runFork
    );
  }, [map, toast, setSearch]);

  const dataLayerPointQuery = useQuery({
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!dataLayerTarget,
    queryKey: [
      "data-layer-point",
      zoom,
      dataLayerTarget?.layer,
      dataLayerTarget?.point,
    ],
    queryFn: () => {
      const { point, layer } = dataLayerTarget!;

      let radius = 0;

      if (zoom > 16) {
        radius = 10;
      } else if (zoom > 14) {
        radius = 50;
      } else {
        radius = 100;
      }

      return pipe(
        findForLayerAt(layer, point, radius, { pageLength: "1" }),
        Effect.map((_) => A.head(_.features)),
        Effect.provideLayer(
          DataLayerRepositoryLive.pipe(
            Layer.use(getFeatureService()),
            Layer.use(HttpClientLive)
          )
        ),
        Effect.runPromise
      );
    },
  });

  const onDraw = useCallback(
    (e: DrawEvent) => {
      const layer =
        e.type === "draw:created" ? e.layer : e.layers.getLayers()[0];

      let data = {} as
        | { type: "circle"; radius: number; latlng: LatLng }
        | { type: "polygon"; geometry: unknown };

      if (layer instanceof L.Circle) {
        const _layer = layer as L.Circle;
        const latlng = _layer.getLatLng();
        const radius = _layer.getRadius();
        data = { type: "circle", radius, latlng };
      }

      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const _layer = layer as L.Polygon;
        const { geometry } = _layer.toGeoJSON();
        data = { type: "polygon", geometry };
      }

      setSearch((search) => {
        if (e.type == "draw:deleted") {
          search.delete("area");
        } else {
          search.set("area", jsurl.stringify(data));
        }
        return search;
      });

      setDrawnLayer((current) => {
        if (e.type !== "draw:deleted") {
          if (e.type === "draw:created") {
            current?.remove();
          }

          return layer;
        } else {
          current?.remove();
          return null;
        }
      });
    },
    [setSearch]
  );

  const onMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      const srcEl = e.originalEvent?.srcElement as HTMLElement | null;

      const mapClick = srcEl?.classList.toString().includes("leaflet");

      if (isDrawing || !mapClick) return;

      const point = e.latlng;

      const selectedLayers = pipe(
        O.fromNullable(selectedDataLayersRef.current),
        O.getOrElse(() => [] as number[])
      );

      pipe(
        mergedDataLayersByID,
        O.flatMap(flow(E.getOrNull, O.fromNullable)),
        O.flatMap((layers) =>
          pipe(
            selectedLayers,
            A.map((layer) => layers[layer]),
            A.last
          )
        ),
        O.match({
          onNone: () => {},
          onSome(layer) {
            setDataLayerTarget({ point, layer });
          },
        })
      );
    },
    [isDrawing, mergedDataLayersByID]
  );

  const onMouseMove = useCallback((e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setCursor((_) => ({ ..._, lat, lng }));
  }, []);

  const onZoomChange = useCallback(() => {
    const map = mapRef.current;

    if (map) {
      const z = map.getZoom();
      setCursor((_) => ({ ..._, z }));
      updateURLSearchWithoutNavigation("z", z.toString());
    }
  }, []);

  const branchesMarkers = useMemo(() => {
    return pipe(
      filteredBranches,
      O.match({
        onNone: constNull,
        onSome: E.match({
          onLeft: constNull,
          onRight(branches) {
            return (
              <MarkerClusterGroup chunkedLoading>
                {branches.map(({ id, properties }) => {
                  const lat = properties.latitude;
                  const lng = properties.longitude;

                  const { color, ...props } = properties;

                  const icon =
                    tab === Tab.branches && dataVariant === Variant.branch
                      ? createBranchIcon()
                      : tab === Tab.branches && dataVariant === Variant.pos
                      ? createPOSIcon()
                      : createATMIcon();

                  const map = mapRef.current;

                  return (
                    <Marker
                      key={id}
                      icon={icon}
                      position={[lat, lng]}
                      eventHandlers={{
                        popupclose() {
                          // @ts-expect-error
                          updateURLSearchWithoutNavigation("branch", null);
                        },
                        click() {
                          if (id) {
                            document
                              .getElementById(id as any)
                              ?.scrollIntoView();

                            updateURLSearchWithoutNavigation(
                              "branch",
                              id.toString()
                            );

                            map?.flyTo([lat, lng], 16);
                          }
                        },
                      }}
                    >
                      <Popup autoPan>
                        <div className="space-y-4">
                          {props.type ? (
                            <div
                              className="text-white rounded-md py-2 px-4"
                              style={{ backgroundColor: color }}
                            >
                              <h2 className="font-semibold text-lg">
                                {props.type}
                              </h2>
                            </div>
                          ) : null}

                          <div className="flex space-x-2 items-center justify-between">
                            <div>
                              <BiLocationPlus size={20} />
                            </div>

                            <div className="flex-1 space-y-1">
                              <h5>
                                <strong>
                                  {dataVariant === Variant.atm
                                    ? "Address"
                                    : "Address"}
                                </strong>
                              </h5>

                              <p>
                                <strong>
                                  {dataVariant === Variant.branch
                                    ? props.address
                                    : props.address}
                                </strong>
                              </p>
                            </div>

                            <Center height="30px">
                              <Divider orientation="vertical" />
                            </Center>

                            <Button
                              size="sm"
                              onClick={() => setShowStreetview({ lat, lng })}
                            >
                              Street View
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {/* {dataVariant === Variant.branch ? (
                              <Button
                                as="a"
                                size="sm"
                                target="_blank"
                                className="w-full"
                                rel="noopener noreferrer"
                                href={appointmentBookingUrl}
                              >
                                Book Appointment
                              </Button>
                            ) : null} */}

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                map?.closePopup();

                                setSearch((search) => {
                                  search.set("d", `${lat},${lng}`);
                                  return search;
                                });
                              }}
                            >
                              Get Directions
                            </Button>
                          </div>
                        </div>
                      </Popup>

                      <Tooltip>
                        {dataVariant === Variant.branch ? (
                          <p>{props.branch_name}</p>
                        ) : null}
                        <p>{props.address}</p>
                      </Tooltip>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            );
          },
        }),
      })
    );
  }, [filteredBranches, setSearch, dataVariant]);

  const compertitorsMarkers = useMemo(() => {
    if (!showCompetitors) return null;
    // setSearch((search) => {
    //   search.delete("clear");
    //   return search;
    // });
    return pipe(
      filteredCompetitors,
      O.match({
        onNone: constNull,
        onSome: E.match({
          onLeft: constNull,
          onRight(competitors) {
            return (
              <MarkerClusterGroup chunkedLoading>
                {competitors.map(({ id, properties }) => {
                  const lat = properties.latitude;
                  const lng = properties.longitude;
                  const bank = properties.bank_name;
                  const { color, ...props } = properties;

                  const icon =
                    dataVariant === Variant.branch
                      ? createBankIcon(bank)
                      : dataVariant === Variant.pos
                      ? createBankIcon(bank)
                      : createBankIcon(bank);

                  const map = mapRef.current;

                  return (
                    <Marker
                      key={id}
                      icon={icon}
                      position={[lat, lng]}
                      eventHandlers={{
                        popupclose() {
                          // @ts-expect-error
                          updateURLSearchWithoutNavigation("branch", null);
                        },
                        click() {
                          if (id) {
                            document
                              .getElementById(id as any)
                              ?.scrollIntoView();

                            updateURLSearchWithoutNavigation(
                              "branch",
                              id.toString()
                            );

                            map?.flyTo([lat, lng], 16);
                          }
                        },
                      }}
                    >
                      <Popup autoPan>
                        <div className="space-y-4">
                          {props.type ? (
                            <div
                              className="text-white rounded-md py-2 px-4"
                              style={{ backgroundColor: color }}
                            >
                              <h2 className="font-semibold text-lg">
                                {props.type}
                              </h2>
                            </div>
                          ) : null}

                          <div className="flex space-x-2 items-center justify-between">
                            <div>
                              <BiLocationPlus size={20} />
                            </div>

                            <div className="flex-1 space-y-1">
                              <h5>
                                <strong>
                                  {dataVariant === Variant.atm
                                    ? "Address"
                                    : "Address"}
                                </strong>
                              </h5>

                              <p>
                                <strong>
                                  {dataVariant === Variant.branch
                                    ? props.address
                                    : props.address}
                                </strong>
                              </p>
                            </div>

                            <Center height="30px">
                              <Divider orientation="vertical" />
                            </Center>

                            <Button
                              size="sm"
                              onClick={() => setShowStreetview({ lat, lng })}
                            >
                              Street View
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {/* {dataVariant === Variant.branch ? (
                              <Button
                                as="a"
                                size="sm"
                                target="_blank"
                                className="w-full"
                                rel="noopener noreferrer"
                                href={appointmentBookingUrl}
                              >
                                Book Appointment
                              </Button>
                            ) : null} */}

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                map?.closePopup();

                                setSearch((search) => {
                                  search.set("d", `${lat},${lng}`);
                                  return search;
                                });
                              }}
                            >
                              Get Directions
                            </Button>
                          </div>
                        </div>
                      </Popup>

                      <Tooltip>
                        {dataVariant === Variant.branch ? (
                          <>
                            <p>{props.bank_name}</p>
                            <p>{props.branch_name}</p>
                          </>
                        ) : null}
                        <p>{props.address}</p>
                      </Tooltip>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            );
          },
        }),
      })
    );
  }, [filteredCompetitors, setSearch, dataVariant, showCompetitors]);
  // @ts-expect-error
  const handleCheckboxChange = (layerId) => (e) => {
    const set = new Set(selectedDataLayers);

    if (e.target.checked) {
      set.add(layerId);
    } else {
      set.delete(layerId);
    }

    setSearch((search) => {
      if (set.size > 0) {
        search.set("layers", jsurl.stringify([...set]));
      } else {
        search.delete("layers");
      }
      return search;
    });

    setSelectedDataLayers([...set]);
  };

  const mapDataLayers = useMemo(() => {
    return pipe(
      dataLayers,
      O.match({
        onNone: constNull,
        onSome: E.match({
          onLeft: constNull,
          onRight(dataLayers) {
            return (
              <DataLayerControl position="topright">
                <div className="flex flex-col">
                  <div>
                    <h2 className="font-bold">My Bank</h2>

                    {dataLayers.map((layer) => {
                      const selected = selectedDataLayers.includes(layer.id);

                      return (
                        <div key={layer.id} className="whitespace-nowrap">
                          <Checkbox
                            key={layer.id}
                            value={layer.id}
                            isChecked={selected}
                            onChange={handleCheckboxChange(layer.id)}
                          >
                            {layer.title}
                          </Checkbox>

                          {selected ? (
                            <ul className="p-2">
                              {layer.legend.map((legend) => {
                                return (
                                  <li key={legend.value} className="space-x-2">
                                    <span
                                      className="w-4 h-4 inline-block align-middle"
                                      style={{
                                        backgroundColor: legend.color,
                                      }}
                                    />
                                    <span>{legend.value}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h2>Competitions</h2>
                    {pipe(
                      dataLayersForCompetitors,
                      O.match({
                        onNone: constNull,
                        onSome: E.match({
                          onLeft: constNull,
                          onRight(dataLayersForCompetitors) {
                            return dataLayersForCompetitors.map((layer) => {
                              const selected = selectedDataLayers.includes(
                                layer.id
                              );

                              return (
                                <div
                                  key={layer.id}
                                  className="whitespace-nowrap"
                                >
                                  <Checkbox
                                    key={layer.id}
                                    value={layer.id}
                                    isChecked={selected}
                                    onChange={handleCheckboxChange(layer.id)}
                                  >
                                    {layer.title}
                                  </Checkbox>

                                  {selected ? (
                                    <ul className="p-2">
                                      {layer.legend.map((legend) => {
                                        return (
                                          <li
                                            key={legend.value}
                                            className="space-x-2"
                                          >
                                            <span
                                              className="w-4 h-4 inline-block align-middle"
                                              style={{
                                                backgroundColor: legend.color,
                                              }}
                                            />
                                            <span>{legend.value}</span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  ) : null}
                                </div>
                              );
                            });
                          },
                        }),
                      })
                    )}
                  </div>
                </div>
              </DataLayerControl>
            );
          },
        }),
      })
    );
  }, [dataLayers, dataLayersForCompetitors, selectedDataLayers, setSearch]);

  const mapLayerForAreaMap = useMemo(() => {
    return pipe(
      dataLayersForAreaMap,
      O.match({
        onNone: constNull,
        onSome: E.match({
          onLeft: constNull,
          onRight(dataLayersForAreaMap) {
            return (
              <DataLayerControlForAreaName position="topright">
                <h2 className="font-bold">Area Map of Nigeria</h2>

                {dataLayersForAreaMap.map((layer) => {
                  const selected = selectedDataLayers.includes(layer.id);

                  return (
                    <div key={layer.id} className="whitespace-nowrap">
                      <Checkbox
                        key={layer.id}
                        value={layer.id}
                        isChecked={selected}
                        onChange={handleCheckboxChange(layer.id)}
                      >
                        {layer.title}
                      </Checkbox>

                      {selected ? (
                        <ul className="p-2">
                          {layer.legend.map((legend) => {
                            return (
                              <li key={legend.value} className="space-x-2">
                                <span
                                  className="w-4 h-4 inline-block align-middle"
                                  style={{
                                    backgroundColor: legend.color,
                                  }}
                                />
                                <span>{legend.value}</span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </DataLayerControlForAreaName>
            );
          },
        }),
      })
    );
  }, [dataLayersForAreaMap, selectedDataLayers, setSearch]);

  const drawnLayerBounds =
    drawnLayer instanceof L.Circle
      ? drawnLayer.getLatLng().toBounds(drawnLayer.getRadius()) // for some reason, calling `drawnLayer.getBounds()` throws an error
      : drawnLayer instanceof L.Polygon || drawnLayer instanceof L.Rectangle
      ? drawnLayer.getBounds()
      : null;

  const drawnLayerCenter = drawnLayerBounds?.getCenter();

  const dataLayersSelection = useMemo(() => {
    return pipe(
      O.Do,
      O.bind("layers", () => dataLayers),
      O.bind("result", () => O.fromNullable(dataLayerSelectionResult)),
      O.match({
        onNone: constNull,
        onSome(_) {
          return pipe(
            E.all(_),
            E.match({
              onLeft: constNull,
              onRight: ({ layers, result: data }) => {
                return pipe(
                  O.fromNullable(drawnLayerCenter),
                  O.orElse(() =>
                    pipe(
                      A.head([...Object.values(data)]),
                      O.filter((_) => _?.features.length > 0),
                      O.map((head) => {
                        const geojson = L.geoJson(head);
                        return geojson.getBounds().getCenter();
                      })
                    )
                  ),
                  O.match({
                    onNone: constNull,
                    onSome(center) {
                      setDataLayerSelectionResultForAreaMap(undefined),
                        setDataLayerSelectionResultForCompetitors(undefined);
                      return (
                        <>
                          {Object.keys(data).map((key) => {
                            const geojson =
                              data[key as any as keyof typeof data];
                            return <GeoJSON key={key} data={geojson} />;
                          })}

                          <Popup
                            keepInView
                            position={center}
                            autoClose={false}
                            closeButton={false}
                            closeOnClick={false}
                          >
                            <div className="space-y-3 data-layer-popup">
                              <ul className="py-2 space-y-2 divide-y">
                                {Object.keys(data).map((k) => {
                                  const key = k as unknown as keyof typeof data;
                                  const { features } = data[key];

                                  const layer = layers.find(
                                    (layer) => layer.id == key
                                  );

                                  const group = groupLayerAttributesByCategory(
                                    layer!
                                  );

                                  return (
                                    <li key={key} className="space-y-2">
                                      <div className="py-2 px-4 bg-[var(--brand)] rounded-md text-white">
                                        <h2 className="font-bold text-white text-base whitespace-nowrap truncate">
                                          {layer?.title} (Summary)
                                        </h2>
                                      </div>

                                      {Object.keys(group).map((k) => {
                                        const key =
                                          k as any as keyof typeof group;
                                        const attrs = group[key];

                                        return (
                                          <details
                                            key={key}
                                            className="bg-white rounded-md py-2 px-4"
                                          >
                                            <summary>
                                              <h4 className="capitalize font-medium text-lg inline align-middle px-2">
                                                {key.toLowerCase()}
                                              </h4>
                                            </summary>

                                            <ul className="divide-y">
                                              {attrs.map((attr) => {
                                                return (
                                                  <li
                                                    key={attr.value}
                                                    className="py-2 space-y-0"
                                                  >
                                                    <h4 className="capitalize text-base text-gray-600 font-medium">
                                                      {attr.value
                                                        .replace(/_/g, " ")
                                                        .toLowerCase()}
                                                    </h4>

                                                    <AttributeSummary
                                                      attribute={attr}
                                                      features={features}
                                                    />
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </details>
                                        );
                                      })}
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="flex w-full justify-between">
                                <Button
                                  size="sm"
                                  className=""
                                  onClick={() => {
                                    // // @ts-expect-error
                                    // updateURLSearchWithoutNavigation("dl", null);

                                    setDataLayerSelectionResultForAreaMap(
                                      undefined
                                    );

                                    setSearch((search) => {
                                      search.delete("area");
                                      return search;
                                    });
                                  }}
                                >
                                  Close
                                </Button>
                                <Button
                                  size="sm"
                                  leftIcon={<FaDownload />}
                                  onClick={() => {
                                    // @ts-expect-error
                                    downloadCSV(data);
                                  }}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </>
                      );
                    },
                  })
                );
              },
            })
          );
        },
      })
    );
  }, [
    dataLayerSelectionResult,
    drawnLayer,
    toast,
    navigate,
    selectedDataLayers.length,
    setSearch,
  ]);

  const dataLayersSelectionForCompetitors = useMemo(() => {
    return pipe(
      O.Do,
      O.bind("layers", () => dataLayersForCompetitors),
      O.bind("result", () =>
        O.fromNullable(dataLayerSelectionResultForCompetitors)
      ),
      O.match({
        onNone: constNull,
        onSome(_) {
          return pipe(
            E.all(_),
            E.match({
              onLeft: constNull,
              onRight: ({ layers, result: data }) => {
                return pipe(
                  O.fromNullable(drawnLayerCenter),
                  O.orElse(() =>
                    pipe(
                      A.head([...Object.values(data)]),
                      O.filter((_) => _.features.length > 0),
                      O.map((head) => {
                        const geojson = L.geoJson(head);
                        return geojson.getBounds().getCenter();
                      })
                    )
                  ),
                  O.match({
                    onNone: constNull,
                    onSome(center) {
                      setDataLayerSelectionResult(undefined),
                        setDataLayerSelectionResultForAreaMap(undefined);
                      return (
                        <>
                          {Object.keys(data).map((key) => {
                            const geojson =
                              data[key as any as keyof typeof data];
                            return <GeoJSON key={key} data={geojson} />;
                          })}

                          <Popup
                            keepInView
                            position={center}
                            autoClose={false}
                            closeButton={false}
                            closeOnClick={false}
                          >
                            <div className="space-y-3 data-layer-popup">
                              <h1 className="font-bold">
                                Competitor's Selection Data
                              </h1>

                              <ul className="py-2 space-y-2 divide-y">
                                {Object.keys(data).map((k) => {
                                  const key = k as unknown as keyof typeof data;
                                  const { features } = data[key];

                                  const layer = layers.find(
                                    (layer) => layer.id == key
                                  );

                                  const group = groupLayerAttributesByCategory(
                                    layer!
                                  );

                                  return (
                                    <li key={key} className="space-y-2">
                                      <div className="py-2 px-4 bg-[var(--brand)] rounded-md text-white">
                                        <h2 className="font-bold text-white text-base whitespace-nowrap truncate">
                                          {layer?.title} (Summary)
                                        </h2>
                                      </div>

                                      {Object.keys(group).map((k) => {
                                        const key =
                                          k as any as keyof typeof group;
                                        const attrs = group[key];

                                        return (
                                          <details
                                            key={key}
                                            className="bg-white rounded-md py-2 px-4"
                                          >
                                            <summary>
                                              <h4 className="capitalize font-medium text-lg inline align-middle px-2">
                                                {key.toLowerCase()}
                                              </h4>
                                            </summary>

                                            <ul className="divide-y">
                                              {attrs.map((attr) => {
                                                return (
                                                  <li
                                                    key={attr.value}
                                                    className="py-2 space-y-0"
                                                  >
                                                    <h4 className="capitalize text-base text-gray-600 font-medium">
                                                      {attr.value
                                                        .replace(/_/g, " ")
                                                        .toLowerCase()}
                                                    </h4>

                                                    <AttributeSummary
                                                      attribute={attr}
                                                      features={features}
                                                    />
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </details>
                                        );
                                      })}
                                    </li>
                                  );
                                })}
                              </ul>

                              <div className="flex w-full justify-between">
                                <Button
                                  size="sm"
                                  className=""
                                  onClick={() => {
                                    // // @ts-expect-error
                                    // updateURLSearchWithoutNavigation("dl", null);

                                    setDataLayerSelectionResultForAreaMap(
                                      undefined
                                    );

                                    setSearch((search) => {
                                      search.delete("area");
                                      return search;
                                    });
                                  }}
                                >
                                  Close
                                </Button>
                                <Button
                                  size="sm"
                                  leftIcon={<FaDownload />}
                                  onClick={() => {
                                    // @ts-expect-error
                                    downloadCSV(data);
                                  }}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </>
                      );
                    },
                  })
                );
              },
            })
          );
        },
      })
    );
  }, [
    dataLayerSelectionResultForCompetitors,
    drawnLayer,
    toast,
    navigate,
    selectedDataLayers.length,
    setSearch,
  ]);

  const dataLayersSelectionForAreaMap = useMemo(() => {
    return pipe(
      O.Do,
      O.bind("layers", () => dataLayersForAreaMap),
      O.bind("result", () =>
        O.fromNullable(dataLayerSelectionResultForAreaMap)
      ),
      O.match({
        onNone: constNull,
        onSome(_) {
          return pipe(
            E.all(_),
            E.match({
              onLeft: constNull,
              onRight: ({ layers, result: data }) => {
                return pipe(
                  O.fromNullable(drawnLayerCenter),
                  O.orElse(() =>
                    pipe(
                      A.head([...Object.values(data)]),
                      O.filter((_) => _.features.length > 0),
                      O.map((head) => {
                        const geojson = L.geoJson(head);
                        return geojson.getBounds().getCenter();
                      })
                    )
                  ),
                  O.match({
                    onNone: constNull,
                    onSome(center) {
                      setDataLayerSelectionResult(undefined),
                        setDataLayerSelectionResultForCompetitors(undefined);
                      return (
                        <>
                          {Object.keys(data).map((key) => {
                            const geojson =
                              data[key as any as keyof typeof data];
                            return <GeoJSON key={key} data={geojson} />;
                          })}

                          <Popup
                            keepInView
                            position={center}
                            autoClose={false}
                            closeButton={false}
                            closeOnClick={false}
                          >
                            <div className="space-y-3 data-layer-popup">
                              <h1 className="font-bold">
                                Area Name Selection Data
                              </h1>
                              <ul className="py-2 space-y-2 divide-y">
                                {Object.keys(data).map((k) => {
                                  const key = k as unknown as keyof typeof data;
                                  const { features } = data[key];

                                  const layer = layers.find(
                                    (layer) => layer.id == key
                                  );

                                  const group = groupLayerAttributesByCategory(
                                    layer!
                                  );
                                  return (
                                    <li key={key} className="space-y-2">
                                      <div className="py-2 px-4 bg-[var(--brand)] rounded-md text-white">
                                        <h2 className="font-bold text-white text-base whitespace-nowrap truncate">
                                          {layer?.title} (Summary)
                                        </h2>
                                      </div>

                                      {Object.keys(group).map((k) => {
                                        const key =
                                          k as any as keyof typeof group;
                                        const attrs = group[key];

                                        return (
                                          <details
                                            key={key}
                                            className="bg-white rounded-md py-2 px-4"
                                          >
                                            <summary>
                                              <h4 className="capitalize font-medium text-lg inline align-middle px-2">
                                                {key.toLowerCase()}
                                              </h4>
                                            </summary>

                                            <ul className="divide-y">
                                              {attrs.map((attr) => {
                                                return (
                                                  <li
                                                    key={attr.value}
                                                    className="py-2 space-y-0"
                                                  >
                                                    <h4 className="capitalize text-base text-gray-600 font-medium">
                                                      {attr.value
                                                        .replace(/_/g, " ")
                                                        .toLowerCase()}
                                                    </h4>

                                                    <AttributeSummary
                                                      attribute={attr}
                                                      features={features}
                                                    />
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </details>
                                        );
                                      })}
                                    </li>
                                  );
                                })}
                              </ul>

                              <div className="flex w-full justify-between">
                                <Button
                                  size="sm"
                                  className=""
                                  onClick={() => {
                                    // // @ts-expect-error
                                    // updateURLSearchWithoutNavigation("dl", null);

                                    setDataLayerSelectionResultForAreaMap(
                                      undefined
                                    );

                                    setSearch((search) => {
                                      search.delete("area");
                                      return search;
                                    });
                                  }}
                                >
                                  Close
                                </Button>
                                <Button
                                  size="sm"
                                  leftIcon={<FaDownload />}
                                  onClick={() => {
                                    // @ts-expect-error
                                    downloadCSV(data);
                                  }}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </>
                      );
                    },
                  })
                );
              },
            })
          );
        },
      })
    );
  }, [
    dataLayerSelectionResultForAreaMap,
    drawnLayer,
    toast,
    navigate,
    selectedDataLayers.length,
    setSearch,
  ]);

  const dataLayerPoint = useMemo(() => {
    return dataLayerTarget && dataLayerPointQuery.data
      ? pipe(
          dataLayerPointQuery.data,
          O.match({
            onNone: constNull,
            onSome(feature) {
              const { layer, point } = dataLayerTarget;

              const group = groupLayerAttributesByCategory(layer);

              return (
                <Popup
                  position={[point.lat, point.lng]}
                  eventHandlers={{ popupclose: () => setDataLayerTarget(null) }}
                >
                  <div className="space-y-2 data-layer-popup">
                    <div className="py-2 px-4 bg-[var(--brand)] rounded-md text-white">
                      <h2 className="font-bold text-base">{layer.title}</h2>
                    </div>

                    <ul className="space-y-3">
                      {Object.entries(group).map(([category, attrs]) => {
                        return (
                          <li
                            key={category}
                            className="bg-white rounded-md py-2 px-4"
                          >
                            <details>
                              <summary>
                                <h4 className="capitalize font-medium text-lg inline align-middle px-2">
                                  {category.toLowerCase()}
                                </h4>
                              </summary>

                              <ul className="divide-y">
                                {attrs.map((attr) => {
                                  const value =
                                    feature.properties?.[attr.value];

                                  return (
                                    <li
                                      key={attr.value}
                                      className="py-2 space-y-0"
                                    >
                                      <h4 className="capitalize text-base text-gray-600 font-medium">
                                        {attr.value
                                          .replace(/_/g, " ")
                                          .toLowerCase()}
                                      </h4>

                                      <p className="text-sm font-medium">
                                        {value}
                                      </p>
                                    </li>
                                  );
                                })}
                              </ul>
                            </details>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </Popup>
              );
            },
          })
        )
      : null;
  }, [dataLayerPointQuery.data, dataLayerTarget]);

  const streetview = useMemo(() => {
    return showStreetview ? (
      <Popup
        autoPan
        autoClose={false}
        closeButton={false}
        closeOnClick={false}
        position={[showStreetview.lat, showStreetview.lng]}
      >
        <motion.div
          layoutId="streetview"
          className="h-[20rem] streetview-popup space-y-3 flex flex-col"
        >
          <StreetView
            latitude={showStreetview.lat}
            longitude={showStreetview.lng}
            key={`${showStreetview.lat}:${showStreetview.lat}`}
          />

          <Button
            size="sm"
            className="w-full"
            onClick={() => setShowStreetview(null)}
          >
            Close
          </Button>
        </motion.div>
      </Popup>
    ) : null;
  }, [showStreetview]);

  useEffect(() => {
    selectedDataLayersRef.current = selectedDataLayers;
  }, [selectedDataLayers]);

  useEffect(() => {
    setDataLayerSelectionResult(loaderDataLayersSelection?.data);
  }, [loaderDataLayersSelection.data]);

  useEffect(() => {
    setDataLayerSelectionResultForCompetitors(
      loaderDataLayersSelectionForCompetitors?.data
    );
  }, [loaderDataLayersSelectionForCompetitors.data]);

  useEffect(() => {
    setDataLayerSelectionResultForAreaMap(
      loaderDataLayersSelectionForAreaMap?.data
    );
  }, [loaderDataLayersSelectionForAreaMap.data]);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    map?.on("click", onMapClick);
    return () => {
      map?.off("click", onMapClick);
    };
  }, [map, onMapClick]);

  useEffect(() => {
    map?.on("mousemove", onMouseMove);
    return () => {
      map?.off("mousemove", onMouseMove);
    };
  }, [map, onMouseMove]);

  useEffect(() => {
    map?.on("zoomend", onZoomChange);
    return () => {
      map?.off("zoomend", onZoomChange);
    };
  }, [map, onZoomChange]);

  // useLayoutEffect(() => {
  //   if (import.meta.env.DEV) {
  //     // @ts-expect-error `setActiveArea` is injected by a leaflet plugin
  //     map?.setActiveArea?.("active-region", true);
  //   }
  // }, [map]);

  useEffect(() => {
    let layer: L.Layer | undefined;
    let control: L.Control.Layers | undefined;

    if (map && isLoaded) {
      import("./google-maps").then(({ baseMaps, googleRoad }) => {
        const options = { collapsed: true, position: "topright" };

        control = L.control
          .layers(baseMaps, undefined, options as any)
          .addTo(map);

        layer = googleRoad as L.Layer;

        map.addLayer(layer);

        setBaseMapRegistered(true);
      });
    }

    return () => {
      control?.remove();
      if (layer) map?.removeLayer(layer);
    };
  }, [map, isLoaded]);

  useEffect(() => {
    if (showSideBar) {
      document.body.classList.remove("sidebar-collapsed");
    } else {
      document.body.classList.add("sidebar-collapsed");
    }
  }, [showSideBar]);

  useEffect(() => {
    if (columnName) {
      updateBrandColor(columnName);
    }
  }, [columnName]);

  useEffect(() => {
    if (showCompetitors) {
      competitorQuery.refetch()
    }
  }, [showCompetitors, competitorQuery]);

  useEffect(() => {
    /** We don't want to execute this every time something minor causes a navigtion event
     * i.e setting the zoom */
    const search = new URLSearchParams(window.location.search);

    const zoom = pipe(
      O.fromNullable(search.get("z")),
      O.filter(S.isNonEmpty),
      O.map(parseFloat),
      O.getOrElse(() => 16)
    );

    /**
     * We need to focus the map on something if the data is available either at initial page load
     * or subsequent internal navigation.
     *
     * Possible items in order of priority:
     *
     * - Direction
     * - Selection using any of the drawing tools
     * - branches
     * - Searched location
     */

    if (navigation.state === "idle") {
      if (directionQuery.data && E.isRight(directionQuery.data)) {
        const route = directionQuery.data.right[0];

        if (route) {
          const feature = L.polyline(
            route.polyline.geoJsonLinestring.coordinates
          );

          map?.flyToBounds(feature.getBounds());
          return;
        }
      }

      if (dataLayerSelectionResult && E.isRight(dataLayerSelectionResult)) {
        const result = dataLayerSelectionResult.right;

        const data = [...Object.values(result)][0];

        if (data && data.features.length > 0) {
          map?.flyToBounds(L.geoJson(data).getBounds());
          return;
        }
      }

      if (
        dataLayerSelectionResultForCompetitors &&
        E.isRight(dataLayerSelectionResultForCompetitors)
      ) {
        const result = dataLayerSelectionResultForCompetitors.right;

        const data = [...Object.values(result)][0];

        if (data && data.features.length > 0) {
          map?.flyToBounds(L.geoJson(data).getBounds());
          return;
        }
      }

      if (
        dataLayerSelectionResultForAreaMap &&
        E.isRight(dataLayerSelectionResultForAreaMap)
      ) {
        const result = dataLayerSelectionResultForAreaMap.right;

        const data = [...Object.values(result)][0];

        if (data && data.features.length > 0) {
          map?.flyToBounds(L.geoJson(data).getBounds());
          return;
        }
      }

      if (tab === Tab.branches) {
        if (O.isSome(selectedBranch)) {
          const branch = selectedBranch.value.properties;
          const lat = branch.latitude;
          const lng = branch.longitude;
          map?.flyTo([lat, lng], zoom);
          return;
        }

        const branches_ = pipe(
          filteredBranches,
          O.flatMap(flow(E.getOrNull, O.fromNullable)),
          O.getOrNull
        );

        if (branches_) {
          const group = L.featureGroup();
          const feature = L.geoJson(branches_);

          group.addLayer(feature);

          // @ts-expect-error

          if (loaderData.latlng) {
            // @ts-expect-error
            const { lat, lng } = loaderData.latlng;
            group.addLayer(L.marker([lat, lng]));
          }

          map?.flyToBounds(group.getBounds());
          return;
        }
      }
      // @ts-expect-error
      if (loaderData.latlng) {
        // @ts-expect-error
        const { lat, lng } = loaderData.latlng;
        map?.flyTo([lat, lng], zoom);
      }
    }
  }, [
    map,
    tab,
    // @ts-expect-error
    loaderData.latlng,
    filteredBranches,
    selectedBranch,
    dataLayerSelectionResult,
    dataLayerSelectionResultForCompetitors,
    dataLayerSelectionResultForAreaMap,
    directionQuery.data,
    navigation.state,
  ]);

  // useEffect(() => {
  //   setLocalLoaderData(loaderData);
  // }, [loaderData]);

  const tabSearchType = pipe(
    searchType,
    O.match({
      onNone: () => (showInternalTools ? SearchType.all : SearchType.nearest),
      onSome: identity,
    })
  );

  const branchURLSearch = `tab=${Tab.branches}&searchType=${tabSearchType}`;
  const nearestURLSearch = `tab=${Tab.branches}&searchType=${SearchType.nearest}`;

  const steps = [
    {
      selector: ".search-field-intro",
      content:
        "Search for a location in order to get branches, view POS agents and ATM stands around you.",
    },
    {
      selector: ".search-field-auto-intro",
      content: "You can also search using your current location",
    },
    { selector: ".leaflet-control-layers", content: "Change Base Layers" },

    showInternalTools
      ? {
          selector: ".leaflet-draw",
          content:
            "Drawing tools to query features on the map based on the data layers",
        }
      : null,

      showInternalTools
      ? { selector: ".data-layers-intro", content: "Branches" }
      : null,


    showInternalTools
      ? { selector: ".data-layers-intro_", content: "Socio-economic data" }
      : null,


    {
      selector: ".zoom-default",
      content: "Default zoom to set map zoom level to default",
    },

    {
      selector: ".leaflet-control-zoom",
      content: "Zoom controls to adjust the map zoom level",
    },
  ];

  const lists = [
    { id: 1, name: "Branches", icon: IoStorefront, variant: Variant.branch },
    {
      id: 2,
      name: "POS Agents (nearest)",
      icon: IoStorefront,
      variant: Variant.pos,
    },
    { id: 3, name: "ATM (nearest)", icon: IoStorefront, variant: Variant.atm },
  ];

  // @ts-expect-error
  const toggle = (id) => {
    setIsSelected(isSelected === id ? null : id);
  };

  const toggleCompetitors = () => {
    setShowCompetitors((prev) => !prev);
 
  };

  return (
    <>
      <main className="h-full flex flex-col">
        {isLoaded ? (
          <MapContainer
            zoom={zoom}
            ref={setMap}
            minZoom={6}
            maxZoom={18}
            zoomControl={false}
            center={[lat, lng]}
            attributionControl={false}
            maxBounds={maxMapViewBounds}
            className={clsx("h-full flex-1", styles.map)}
          >
            <DefaultZommControl
              position={isLargeScreen ? "bottomright" : "topleft"}
            />
            <ZoomControl position={isLargeScreen ? "bottomright" : "topleft"} />

            {loaderDataLayers.data
              ? pipe(
                  loaderDataLayers.data,
                  E.match({
                    onLeft: constNull,
                    onRight(layers) {
                      return layers
                        .filter((layer) =>
                          selectedDataLayers.includes(layer.id)
                        )
                        .map((layer) => {
                          return (
                            <WMSTileLayer
                              transparent
                              layers="nmc"
                              opacity={0.7}
                              key={layer.id}
                              format="image/png"
                              id={layer.id.toString()}
                              url={`${layerURL}?layer=${layer.mapName}`}
                            />
                          );
                        });
                    },
                  })
                )
              : null}

            {loaderDataLayersForCompetitors.data
              ? pipe(
                  loaderDataLayersForCompetitors.data,
                  E.match({
                    onLeft: constNull,
                    onRight(layers) {
                      return layers
                        .filter((layer) =>
                          selectedDataLayers.includes(layer.id)
                        )
                        .map((layer) => {
                          return (
                            <WMSTileLayer
                              transparent
                              layers="nmc"
                              opacity={0.7}
                              key={layer.id}
                              format="image/png"
                              id={layer.id.toString()}
                              url={`${layerURL}?layer=${layer.mapName}`}
                            />
                          );
                        });
                    },
                  })
                )
              : null}

            {loaderDataLayersForAreaMap.data
              ? pipe(
                  loaderDataLayersForAreaMap.data,
                  E.match({
                    onLeft: constNull,
                    onRight(layers) {
                      return layers
                        .filter((layer) =>
                          selectedDataLayers.includes(layer.id)
                        )
                        .map((layer) => {
                          return (
                            <WMSTileLayer
                              transparent
                              layers="nmc"
                              opacity={0.7}
                              key={layer.id}
                              format="image/png"
                              id={layer.id.toString()}
                              url={`${layerURL}?layer=${layer.mapName}`}
                            ></WMSTileLayer>
                          );
                        });
                    },
                  })
                )
              : null}

            {streetview}

            {dataLayersSelection}
            {dataLayersSelectionForCompetitors}
            {dataLayersSelectionForAreaMap}

            {dataLayerPoint}

            {directionQuery.data
              ? pipe(
                  directionQuery.data,
                  E.match({
                    onLeft: constNull,
                    onRight(routes) {
                      return (
                        <Direction
                          routes={routes}
                          onClear={() => {
                            setSearch((search) => {
                              search.delete("d");
                              return search;
                            });
                          }}
                        />
                      );
                    },
                  })
                )
              : null}

            {branchesMarkers}
            {compertitorsMarkers}

            {markerLatlng ? (
              <Marker
                {...markerProps}
                ref={markerRef}
                key={`${lat}-${lng}`}
                position={markerLatlng}
                eventHandlers={markerEventHandlers}
              >
                <Popup>
                  <motion.div layoutId="streetview">
                    <Button
                      className="w-full"
                      onClick={() => setShowStreetview({ lat, lng })}
                    >
                      Street View
                    </Button>
                  </motion.div>
                </Popup>
              </Marker>
            ) : null}

            {dataLayerTarget &&
            (dataLayerPointQuery.isFetching || dataLayerPointQuery.isError) ? (
              <Popup keepInView position={dataLayerTarget.point}>
                {dataLayerPointQuery.isError ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <span className="text-center">An error occurred.</span>

                    <Button
                      size="xs"
                      className="w-fit"
                      onClick={() => dataLayerPointQuery.refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Loader />
                )}
              </Popup>
            ) : null}

            {drawnLayerCenter &&
            (loaderDataLayersSelection.isFetching ||
              loaderDataLayersSelection.isError) ? (
              <Popup keepInView position={drawnLayerCenter}>
                {loaderDataLayersSelection.isError ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <span className="text-center">An error occurred.</span>

                    <Button
                      size="xs"
                      className="w-fit"
                      onClick={() => loaderDataLayersSelection.refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Loader />
                )}
              </Popup>
            ) : null}

            {drawnLayerCenter &&
            (loaderDataLayersSelectionForCompetitors.isFetching ||
              loaderDataLayersSelectionForCompetitors.isError) ? (
              <Popup keepInView position={drawnLayerCenter}>
                {loaderDataLayersSelectionForCompetitors.isError ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <span className="text-center">An error occurred.</span>

                    <Button
                      size="xs"
                      className="w-fit"
                      onClick={() =>
                        loaderDataLayersSelectionForCompetitors.refetch()
                      }
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Loader />
                )}
              </Popup>
            ) : null}

            {drawnLayerCenter &&
            (loaderDataLayersSelectionForAreaMap.isFetching ||
              loaderDataLayersSelectionForAreaMap.isError) ? (
              <Popup keepInView position={drawnLayerCenter}>
                {loaderDataLayersSelectionForAreaMap.isError ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <span className="text-center">An error occurred.</span>

                    <Button
                      size="xs"
                      className="w-fit"
                      onClick={() =>
                        loaderDataLayersSelectionForAreaMap.refetch()
                      }
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Loader />
                )}
              </Popup>
            ) : null}

            {pipe(
              directionTo,
              O.match({
                onNone: constNull,
                onSome(to) {
                  return directionQuery.isFetching || directionQuery.isError ? (
                    <Popup keepInView position={to}>
                      {directionQuery.isError ? (
                        <div className="flex flex-col items-center justify-center py-2 space-y-2">
                          <span className="text-center">
                            An error occurred calculating route.
                          </span>

                          <Button
                            size="xs"
                            className="w-fit"
                            onClick={() => directionQuery.refetch()}
                          >
                            Retry
                          </Button>
                        </div>
                      ) : (
                        <Loader />
                      )}
                    </Popup>
                  ) : null;
                },
              })
            )}

            {showInternalTools && baseMapRegistered ? (
              <>
                {mapDataLayers}

                {mapLayerForAreaMap}
                <FeatureGroup>
                  <EditControl
                    position="topright"
                    onDeleted={onDraw}
                    onEdited={onDraw}
                    onDrawStop={() => setIsDrawing(false)}
                    onDrawStart={() => setIsDrawing(true)}
                    onCreated={onDraw}
                    draw={{
                      circle: true,
                      marker: false,
                      polygon: true,
                      polyline: false,
                      circlemarker: false,
                      rectangle: { showArea: false }, // Work around for https://github.com/Leaflet/Leaflet.draw/issues/1026 and https://stackoverflow.com/a/57443655
                    }}
                  />
                </FeatureGroup>
              </>
            ) : null}
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col">
            <div className="m-auto">
              <Spinner />
            </div>
          </div>
        )}

        <div className={styles.coordinates_preview}>
          <p>
            <span>Lat-Lng:&nbsp;</span>
            <span>
              {cursor.lat.toFixed(5)}, {cursor.lng.toFixed(5)}
            </span>
          </p>

          <p>
            <span>Scale:&nbsp;</span>
            <span>{scalesByZoomLevel[Math.round(cursor.z)]}</span>
          </p>

          <p>
            <span>Zoom:&nbsp;</span>
            <span>{cursor.z}</span>
          </p>
        </div>
      </main>

      <div tabIndex={-1} className="active-region" />

      <div
        className={clsx(
          "py-4 space-y-4  left-0 right-0 h-[45%] lg:top-0 lg:w-[22%] lg:h-[unset] overflow-y-auto",
          styles.side_bar,
          { [styles.side_bar__hidden]: !showSideBar }
        )}
      >
        {organisationLogo}

        <div className="px-4">
          <Search
            onSubmit={onSearch}
            google_maps_loaded={isLoaded}
            onCurrentLocation={onCurrentLocation}
            onAutocomplete={onAutocompletePlaceChange}
          />
        </div>

        {/* <div className="px-4 flex flex-col gap-2">
       <Button
            as={Link}
            size="sm"
            className={styles.tab}
            leftIcon={<IoWifi />}
            to={`/?tab=${Tab.coverages}&p=${lat},${lng}`}
            variant={tab === Tab.coverages ? "solid" : "outline"}
          >
            Coverages
          </Button>

          <Button
            as={Link}
            size="sm"
            className={styles.tab}
            to={`/?${branchURLSearch}&variant=${Variant.branch}`}
            leftIcon={<IoStorefront />}
            variant={
              (tab === Tab.branches && dataVariant === Variant.branch) ||
              dataVariant === Variant.branch
                ? "solid"
                : "outline"
            }
          >
            Branches
          </Button>

          <Button
            as={Link}
            size="sm"
            className={styles.tab}
            leftIcon={<IoPeople />}
            to={`/?${branchURLSearch}&variant=${Variant.pos}`}
            variant={
              tab === Tab.branches && dataVariant === Variant.pos
                ? "solid"
                : "outline"
            }
          >
            POS Agents
          </Button>

          <Button
            as={Link}
            size="sm"
            className={styles.tab}
            leftIcon={<IoPeople />}
            to={`/?${branchURLSearch}&variant=${Variant.customer}`}
            variant={
              tab === Tab.branches && dataVariant === Variant.customer
                ? "solid"
                : "outline"
            }
          >
            ATM Stands
          </Button>
        </div> */}

        <div className="flex flex-col lg:overflow-y-auto">
          <div className="flex-1 flex flex-col p-4 space-y-2">
            <div
              className="flex-1 
            overflow-y-auto"
            >
              {lists.map((list) => {
                const point = `${markerLatlng?.lat},${markerLatlng?.lng}`;

                return (
                  <Box key={list.id} mb={2} className="space-y-2">
                    <Button
                      as={Link}
                      size="sm"
                      onClick={() => {
                        toggle(list.id);
                        setDataVariant(list.variant);
                      }}
                      className={clsx(
                        "w-full flex justify-between items-center "
                      )}
                      leftIcon={<Icon as={list.icon} />}
                      variant={
                        dataVariant === list.variant ? "solid" : "outline"
                      }
                      to={
                        list.name === "Branches"
                          ? `/?${branchURLSearch}&p=${point}&variant=${Variant.branch}`
                          : list.name === "POS Agents (nearest)"
                          ? `/?${nearestURLSearch}&p=${point}&variant=${Variant.pos}`
                          : `/?${nearestURLSearch}&p=${point}&variant=${Variant.atm}`
                      }
                    >
                      <div className="flex justify-between w-full items-center">
                        <span className="flex-1 text-left">{list.name}</span>
                        <Icon as={isSelected === list.id ? IoRemove : IoAdd} />
                      </div>
                    </Button>

                    <Collapse in={isSelected === list.id} animateOpacity>
                      {list.name === "Branches" ? (
                        <div className="flex flex-col space-y-2 p-2 bg-gray-50  border-2 border-[color:gray] rounded-md">
                          <div className="flex space-y-2  items-center justify-between ">
                            <h5 className="font-semibold">My Branches </h5>

                            <div className="flex items-center space-x-2">
                              {showInternalTools ? (
                                <select
                                  value={O.getOrElse(searchType, () => "")}
                                  onChange={(e) => {
                                    setSearch((search) => {
                                      search.set("searchType", e.target.value);
                                      search.delete("clear");
                                      return search;
                                    });
                                  }}
                                >
                                  <option value={SearchType.all}>All</option>
                                  <option value={SearchType.nearest}>
                                    Nearest
                                  </option>
                                </select>
                              ) : (
                                <Button
                                  size="xs"
                                  variant={
                                    showCompetitors ? "solid" : "outline"
                                  }
                                  className=""
                                  onClick={toggleCompetitors}
                                >
                                  Nearest Competition
                                </Button>
                              )}
                            </div>
                          </div>

                          <Divider className="" />
                          <Button
                            size="xs"
                            variant={
                              showCompetitors && point !== "undefined,undefined"
                                ? "solid"
                                : "outline"
                            }
                            className=""
                            onClick={toggleCompetitors}
                          >
                            Nearest Competition
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="xs"
                          variant={
                            showCompetitors && point !== "undefined,undefined"
                              ? "solid"
                              : "outline"
                          }
                          className=""
                          onClick={toggleCompetitors}
                        >
                          Nearest Competition
                        </Button>
                      )}
                    </Collapse>
                  </Box>
                );
              })}

              {/* <Button
                as={Link}
                size="sm"
                className={clsx("space-y-4", styles.network)}
                leftIcon={<IoPeople />}
                to={`/?${branchURLSearch}&variant=${Variant.customer}`}
                variant={
                  tab === Tab.branches && dataVariant === Variant.customer
                    ? "solid"
                    : "outline"
                }
              >
                ATM Stands
              </Button>
              <Collapse in={isSelected === tab.id} animateOpacity>
                <Button size="sm" variant="ghost" className="mt-2 w-full">
                  Competition
                </Button>
              </Collapse> */}
              <div className="flex space-y-2 items-center justify-between">
                <h5 className="font-semibold">Overview</h5>
                <Button
                  size="xs"
                  onClick={() => {
                    setSearch(
                      (search) => {
                        search.delete("d");
                        search.delete("branch");
                        search.delete("searchType");
                        search.set("clear", "true");
                        return search;
                      },
                      { replace: true }
                    );
                    // setLocalLoaderData({ branches: null})
                  }}
                >
                  Clear
                </Button>
              </div>

              {/* <div className="flex space-y-2 items-center justify-between">
                <h5 className="font-semibold">Overview</h5>

                <div className="flex items-center space-x-2">
                  {showInternalTools ? (
                    <select
                      value={O.getOrElse(searchType, () => "")}
                      onChange={(e) => {
                        setSearch((search) => {
                          search.set("searchType", e.target.value);
                          search.delete("clear");
                          return search;
                        });
                      }}
                    >
                      <option>Select</option>
                      <option value={SearchType.all}>All</option>
                      <option value={SearchType.nearest}>Nearest</option>
                    </select>
                  ) : null}

                  <Button
                    size="xs"
                    onClick={() => {
                      setSearch(
                        (search) => {
                          search.delete("d");
                          search.delete("branch");
                          search.delete("searchType");
                          search.set("clear", "true");
                          return search;
                        },
                        { replace: true }
                      );
                      // setLocalLoaderData({ branches: null})
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:overflow-y-auto">
          {tab === Tab.branches ? (
            <div className="flex-1  px-4">
              {pipe(
                filteredBranches,
                O.match({
                  onNone: () =>
                    navigation.state === "loading" ? <Loader /> : null,
                  onSome: E.match({
                    onLeft: (error) => {
                      return (
                        <>
                          {error.message === undefined ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ rotate: 360, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                              }}
                              className="h-full m-auto items-center space-y-2 flex justify-center"
                            >
                              <p className="text-lg">
                                Please search for a location!
                              </p>
                            </motion.div>
                          ) : (
                            <LoadError />
                          )}
                          {/* <LoadError /> */}
                        </>
                      );
                    },
                    onRight: (branches) => {
                      return (
                        <>
                          <ul className="space-y-4">
                            {branches.map(({ id, properties: props }) => {
                              const lat = props.latitude;
                              const lng = props.longitude;

                              return (
                                <li
                                  key={id}
                                  id={id?.toString()}
                                  className={clsx(
                                    "p-4 space-y-1 font-medium bg-gray-50 border-2 border-[color:gray] rounded-md cursor-pointer",
                                    {
                                      ["border-[color:var(--brand)]"]: pipe(
                                        branch,
                                        O.match({
                                          onNone: constFalse,
                                          onSome: (branch) =>
                                            branch == id?.toString(),
                                        })
                                      ),
                                    }
                                  )}
                                  onClick={() => {
                                    map?.flyTo(new L.LatLng(lat, lng), 18);

                                    if (id) {
                                      setSearch((search) => {
                                        search.set("branch", id.toString());
                                        return search;
                                      });
                                    }
                                  }}
                                >
                                  <h4 className="font-medium text-sm">
                                    {props.branch_name}
                                  </h4>

                                  <h6
                                    className="text-sm"
                                    style={{ color: props.color }}
                                  >
                                    {props.type}
                                  </h6>

                                  <div className="text-sm space-y-2">
                                    <p className="">
                                      Address: {formatAddress(props.address)}
                                    </p>
                                    
                                    {
                                      // @ts-expect-error
                                    
                                    loaderData.latlng ? (
                                      <DistanceBetween
                                        end={{ lat, lng }}
                                        // @ts-expect-error
                                        start={loaderData.latlng}
                                      />
                                    ) : null}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      );
                    },
                  }),
                })
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-between px-4">
          {showInternalTools ? (
            <>
              <Button
                variant="outline"
                leftIcon={<BiUserCircle size={20} />}
                onClick={() => {
                  Effect.runSync(
                    pipe(
                      invalidate(),
                      Effect.tap(() =>
                        Effect.sync(() => navigate("/login", { replace: true }))
                      ),
                      Effect.provideLayer(SessionStorageLive)
                    )
                  );
                }}
              >
                Logout
              </Button>

              <Button
                as="a"
                href={helpDoc}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<IoHelp size={20} />}
              >
                Help
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <SidebarToggle
        state={showSideBar ? "visible" : "hidden"}
        onToggle={() => setShowSideBar((t) => !t)}
      />

      <About
        isOpen={showIntroModal}
        type={pipe(
          auth,
          E.match({ onLeft: () => "external", onRight: () => "internal" })
        )}
        onClose={() => {
          setShowIntroModal(false);
          setTourStepsEnabled(true);
        }}
      />

      <Tour
        accentColor="var(--brand)"
        isOpen={tourStepsEnabled && isLoaded}
        steps={steps.filter(nonNullable)}
        onRequestClose={() => setTourStepsEnabled(false)}
        lastStepNextButton={<Button size="sm">Done</Button>}
      />
    </>
  );
}
