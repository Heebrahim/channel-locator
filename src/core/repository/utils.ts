import { SpectrumError } from "../exceptions/spectrum";
import { ApiError as APIError } from "../types/api";

import { JsonParseError, StatusError } from "http-kit/response";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import { ApiError } from "../exceptions";

export function filterSpectrumResult<T>(result: unknown) {
  return !("features" in (result as any))
    ? Effect.fail(new SpectrumError(null, "An error occurred"))
    : Effect.succeed(result as T);
}

export function toApiError<E>(error: E | StatusError) {
  return Effect.if(
    error instanceof StatusError &&
      (error.response.status === 401 || error.response.status === 403),
    {
      onFalse: pipe(
        Effect.tryPromise({
          try: () => {
            const e = error as StatusError;
            return e.response.json() as Promise<APIError>;
          },
          catch: () =>
            new JsonParseError(
              (error as StatusError).response,
              "JsonDecodeError"
            ),
        }),
        Effect.map(({ error }) => new ApiError(error)),
        Effect.flatMap(Effect.fail)
      ),
      onTrue: Effect.fail(error),
    }
  );
}
