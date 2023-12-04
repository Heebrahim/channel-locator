import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import { Interceptor } from "http-kit";
import { HttpRequest } from "http-kit/request";
import { getAuthentication } from "../../core/services/authentication";

const apiError = () =>
  new Response(JSON.stringify({ error: "Unauthorised" }), { status: 403 });

export const withAuthToken: Interceptor = {
  request(req) {
    return pipe(
      getAuthentication(),
      Effect.map((auth) => {
        const clone = req.clone();
        const headers = new Headers(clone.init.headers);
        headers.set("Authorization", `${auth.type} ${auth.token}`);
        return new HttpRequest(clone.url, { ...clone.init, headers });
      }),
      Effect.catchTags({
        DecodeError: () => Effect.succeed(apiError()),
        NoSuchElementException: () => Effect.succeed(apiError()),
      }),
      Effect.provideLayer(SessionStorageLive)
    );
  },
};
