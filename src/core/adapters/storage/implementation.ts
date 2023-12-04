import { Storage } from "./contract";
import * as Option from "@effect/data/Option";
import * as Layer from "@effect/io/Layer";

export const SessionStorageLive = Layer.succeed(
  Storage,
  Storage.of({
    getItem(key) {
      return Option.fromNullable(sessionStorage.getItem(key));
    },
    setItem(key, value) {
      sessionStorage.setItem(key, value);
    },
    removeItem(key) {
      sessionStorage.removeItem(key);
    },
  })
);
