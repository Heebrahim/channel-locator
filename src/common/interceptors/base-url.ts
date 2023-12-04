import { Interceptor } from "http-kit";
import { HttpRequest } from "http-kit/request";
import * as Effect from "@effect/io/Effect";
import * as Option from "@effect/data/Option";
import { pipe } from "@effect/data/Function";

function combineURLs(baseURL: string, relativeURL?: string) {
  return relativeURL
    ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
    : baseURL;
}

export const withBaseUrl: Interceptor = {
  request(req) {
    const clone = req.clone();

    const url = pipe(
      Option.fromNullable(import.meta.env.VITE_PUBLIC_API_URL),
      Option.map((baseUrl) => combineURLs(baseUrl, clone.url)),
      Option.getOrElse(() => clone.url)
    );

    return Effect.succeed(new HttpRequest(url, clone.init));
  },
};
