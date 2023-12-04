import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";

import { StatusError } from "http-kit/response";
import { invalidate } from "@/core/services/authentication";
import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { redirect } from "@/libs/react-router-dom";

export function catch403<E>(error: E | StatusError) {
  return error instanceof StatusError &&
    (error.response.status === 401 || error.response.status === 403)
    ? pipe(
        invalidate(),
        Effect.flatMap(() => redirect("/login")),
        Effect.provideLayer(SessionStorageLive)
      )
    : Effect.fail(error);
}
