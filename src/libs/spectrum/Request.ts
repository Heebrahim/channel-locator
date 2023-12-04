enum RequestState {
  notInitialized,
  connectionEstablished,
  received,
  processing,
  finished,
}

interface GetOptions {
  login?: string;
  password?: string;
  responseType?: XMLHttpRequestResponseType;
}

interface PostOptions {
  login?: string;
  password?: string;
  postData?: any;
  postType?: string;
  responseType?: XMLHttpRequestResponseType;
}

function Deferred() {
  let reject: (reason?: any) => void;
  let resolve: (value: unknown) => void;

  const promise = new Promise((res, rej) => {
    reject = rej;
    resolve = res;
  });

  // @ts-expect-error
  return { promise, resolve, reject };
}

export class SpectrumSpatialRequest {
  private static _createRequest() {
    const deferred = Deferred();

    const request = new XMLHttpRequest();

    request.onerror = function () {
      deferred.reject({
        error: { code: 500, message: "XMLHttpRequest error" },
      });
    };

    request.onreadystatechange = function () {
      let response: any;
      let error: { code: number; message: string } | null = null;

      if (request.readyState === RequestState.finished) {
        try {
          const contentType = this.getResponseHeader("content-type");

          if (contentType?.indexOf("application/json") !== -1) {
            response = JSON.parse(request.responseText);
          } else if (contentType.indexOf("text/xml") !== -1) {
            response = request.responseXML;
          } else {
            response = request.response;
          }
        } catch (e) {
          response = null;
          error = { code: 500, message: "Could not parse response as JSON." };
        }

        if (!error && response.error) {
          error = response.error;
          response = null;
        }

        if (error) {
          return deferred.reject(error);
        }

        deferred.resolve(response);
      }
    };

    return { request, deferred };
  }

  static get(url: string, options: GetOptions = {}) {
    const { request, deferred } = this._createRequest();

    request.open("GET", url, true, options.login, options.password);

    if (options.responseType) {
      request.responseType = options.responseType;
    }

    request.send(null);

    return deferred.promise;
  }

  static post(url: string, options?: PostOptions) {
    options = options || {};
    if (!options.postType) {
      options.postType = "application/json";
    }

    let { request, deferred } = this._createRequest();

    request.open("POST", url, true, options.login, options.password);

    request.setRequestHeader("Content-Type", options.postType);

    if (options.responseType) {
      request.responseType = options.responseType;
    }

    request.send(options.postData);

    return deferred.promise;
  }
}
