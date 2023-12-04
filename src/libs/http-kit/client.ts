import { Interceptor, RequestEffectT, provide } from "http-kit";
import { Interpreter } from "http-kit/interpreter";

import { runPromise } from "@effect/io/Effect";

interface Options {
  adapter: Interpreter;
  interceptors: Array<Interceptor>;
}

export class Client {
  constructor(private options: Options) {
    this.make = this.make.bind(this);
    this.execute = this.execute.bind(this);
  }

  make<_, E, A>(request: RequestEffectT<E, A>) {
    return provide(this.options.adapter, ...this.options.interceptors)(request);
  }

  execute<_, E, A>(request: RequestEffectT<E, A>) {
    return runPromise(this.make(request));
  }
}
