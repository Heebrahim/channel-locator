import * as L from "leaflet";

import { Defaults } from "../Defaults";
import { SpectrumSpatialRequest } from "../Request";
import { Operation } from "./Operation";

export interface ServiceOptions {
  url?: string;
  login?: string;
  password?: string;
  proxyUrl?: string;
  alwaysUseProxy?: boolean;
  forceGet?: boolean;
  encodeUrlForProxy?: boolean;
}

export class Service {
  options: ServiceOptions;

  constructor(url: string, options?: ServiceOptions) {
    options = Object.assign(
      {
        forceGet: Defaults.forceGet,
        alwaysUseProxy: Defaults.alwaysUseProxy,
        encodeUrlForProxy: Defaults.encodeUrlForProxy,
        url: url,
      },
      options
    );

    if (options.proxyUrl === undefined && Defaults.proxyUrl !== undefined) {
      options.proxyUrl = Defaults.proxyUrl;
    }

    this.options = options;
  }

  startRequest(operation: Operation) {
    let urlWithQuery = this.getUrl(operation);

    const queryOptions = {
      postData: operation.getPostData().replace(/'\r\n'/g, ""),
      postType: operation.getPostType(),
      responseType: operation.getResponseType(),
      login: this.options.login,
      password: this.options.password,
    } as any;

    if (operation.isPostOperation()) {
      if (this.options.proxyUrl) {
        urlWithQuery =
          this.options.proxyUrl + this.checkEncodeUrl(urlWithQuery);
      }

      return SpectrumSpatialRequest.post(urlWithQuery, queryOptions);
    } else {
      if (this.options.alwaysUseProxy || this.options.proxyUrl !== undefined) {
        urlWithQuery =
          this.options.proxyUrl + this.checkEncodeUrl(urlWithQuery);
        return SpectrumSpatialRequest.get(urlWithQuery, queryOptions);
      }

      return SpectrumSpatialRequest.get(urlWithQuery, queryOptions);
    }
  }

  getUrl(operation: Operation): string {
    const urlQuery = this.clearParam(operation.getUrlQuery());
    const separator = this.options.url?.slice(-1) === "/" ? "" : "/";
    return this.options.url + separator + urlQuery;
  }

  clearParam(param: string): string {
    if (param[0] === "/") {
      param = param.substring(1);
    }

    if (param.slice(-1) === "/") {
      param = param.substring(0, param.length - 1);
    }

    return param;
  }

  applyParamToXml(
    message: string,
    param: string | null,
    name: string,
    isNode: boolean
  ): string {
    if (isNode) {
      if (param) {
        return message.replace(
          "{" + name + "}",
          L.Util.template("<{name}>{value}</{name}>", {
            name: name,
            value: param,
          })
        );
      }

      return message.replace("{" + name + "}", "");
    }

    if (param) {
      return message.replace("{" + name + "}", name + '="' + param + '"');
    }

    return message.replace("{" + name + "}", "");
  }

  checkEncodeUrl(url: string): string {
    return this.options.encodeUrlForProxy ? encodeURIComponent(url) : url;
  }

  needAuthorization(): boolean {
    return this.options.login !== undefined;
  }
}
