import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { pipe } from "@effect/data/Function";

import { CoverageSignal, CoverageSignalRepository } from "./contract";
import { FeatureService } from "@/core/tags/spectrum";
import { filterSpectrumResult } from "../utils";
import { SpectrumError } from "@/core/exceptions/spectrum";

export const CoverageSignalRepositoryLive = Layer.effect(
  CoverageSignalRepository,
  Effect.gen(function* (_) {
    const service = yield* _(FeatureService);

    return {
      findAtPoint(table, { lat: y, lng: x }) {
        return pipe(
          Effect.tryPromise({
            catch: (e) => new SpectrumError(e),
            try: () =>
              service.searchAtPoint(table, { x, y }, "EPSG:4326", {
                attributes: ["SIGNAL", "DESCRIPTION"],
                tolerance: "1 m",
              }),
          }),
          Effect.flatMap((_) => filterSpectrumResult<CoverageSignal>(_))
        );
      },
    };
  })
);
