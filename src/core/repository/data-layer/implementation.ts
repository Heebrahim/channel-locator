import * as Http from "http-kit";
import * as Res from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { DataLayer } from "../../models/data-layer";
import { APIRes } from "../../types/api";
import { DataLayerRepository } from "./contract";

import { FeatureService } from "@/core/tags/spectrum";
import { FeatureCollection, Geometry } from "geojson";
import { HttpClient } from "@/common/http-client";
import { filterSpectrumResult } from "../utils";
import { SpectrumError } from "@/core/exceptions/spectrum";

export const DataLayerRepositoryLive = Layer.effect(
  DataLayerRepository,
  Effect.gen(function* (_) {
    const service = yield* _(FeatureService);
    const http = yield* _(HttpClient);

    return {
      getAll() {
        return pipe(
          Http.get("/home/map-layers"),
          Res.filterStatusOk(),
          Res.toJson<APIRes<DataLayer[]>>(),
          http.make
        );
      },
      searchAt(layer, { lat: y, lng: x }, radius, options) {
        return pipe(
          Effect.tryPromise({
            catch: (e) => new SpectrumError(e),
            try: () =>
              service.searchAtPoint(layer.tableName, { x, y }, "EPSG:4326", {
                ...options,
                tolerance: `${radius} m`,
              }),
          }),
          Effect.flatMap((_) =>
            filterSpectrumResult<FeatureCollection<Geometry, any>>(_)
          )
        );
      },
      searchWithin(layer, geometry) {
        return pipe(
          Effect.tryPromise({
            catch: (e) => new SpectrumError(e),
            try: () =>
              service.searchNearest(layer.tableName, geometry, {
                maxFeatures: "1000",
                withinDistance: "0 mi",
              }),
          }),
          Effect.flatMap((_) => filterSpectrumResult(_))
        );
      },
    };
  })
);
