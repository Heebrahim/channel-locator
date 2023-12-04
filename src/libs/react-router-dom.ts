import * as Effect from "@effect/io/Effect";
import { redirect as redirect_, RedirectFunction } from "react-router-dom";

export const redirect = (...args: Parameters<RedirectFunction>) =>
  Effect.sync(() => redirect_(...args));

export const toFormData = (request: Request) =>
  Effect.tryPromise({
    try: () => request.formData(),
    catch: (e) => e as Error,
  });
