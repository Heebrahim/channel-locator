import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { getAuthentication } from "@/core/services/authentication";

export const getAuth = () => {
  return pipe(
    getAuthentication(),
    Effect.provideLayer(SessionStorageLive),
    Effect.either,
    Effect.runSync
  );
};