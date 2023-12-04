import { JsonParseError, StatusError } from "http-kit/response";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import { ApiError } from "../types/api";

export function toApiError<E>(error: E | StatusError) {
  return Effect.if(
    error instanceof StatusError &&
      (error.response.status === 401 || error.response.status === 403),
    {
      onFalse: pipe(
        Effect.tryPromise({
          try: () => {
            const e = error as StatusError;
            return e.response.json() as Promise<ApiError>;
          },
          catch: () =>
            new JsonParseError(
              (error as StatusError).response,
              "JsonDecodeError"
            ),
        }),
        Effect.flatMap(Effect.fail)
      ),
      onTrue: Effect.fail(error),
    }
  );
}
