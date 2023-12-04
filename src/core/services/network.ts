import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";

import { NetworkRepository } from "../repository/network/contract";

export function getNetworks() {
  return pipe(
    Effect.flatMap(NetworkRepository, (repo) => repo.getAll()),
    Effect.map((result) => result.data)
  );
}
