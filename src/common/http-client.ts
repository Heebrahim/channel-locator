import * as Context from "@effect/data/Context";
import * as Layer from "@effect/io/Layer";

import { Client, Builder } from "@/libs/http-kit";

import * as Fetcher from "http-kit/fetch";
import { withAuthToken } from "./interceptors/auth-token";
import { withBaseUrl } from "./interceptors/base-url";

export const HttpClient = Context.Tag<Client>();

const baseClient = new Builder()
  .setAdapter(Fetcher.adapter)
  .addInterceptor(withBaseUrl);

export const HttpClientLiveNoAuth = Layer.succeed(
  HttpClient,
  HttpClient.of(baseClient.build())
);

export const HttpClientLive = Layer.succeed(
  HttpClient,
  HttpClient.of(Builder.from(baseClient).addInterceptor(withAuthToken).build())
);
