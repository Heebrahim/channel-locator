import * as Option from "@effect/data/Option";
import * as Context from "@effect/data/Context";

export interface Storage {
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
  getItem(key: string): Option.Option<string>;
}

export const Storage = Context.Tag<Storage>();
