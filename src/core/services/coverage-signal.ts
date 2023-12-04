import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as A from "@effect/data/ReadonlyArray";
import * as Effect from "@effect/io/Effect";

import { Network } from "@/core/models/network";
import { CoverageSignalRepository } from "@/core/repository/coverage-signal/contract";
import { LatLng } from "../types/misc";

export function getCoverage(network: Network, latlng: LatLng) {
  return pipe(
    Effect.flatMap(CoverageSignalRepository, (repo) => {
      return repo.findAtPoint(network.tableName, latlng);
    }),
    Effect.map((result) => A.last(result.features)),
    Effect.map(
      O.flatMap((feature) => O.fromNullable(feature.properties.Signal_Class))
    )
  );
}
