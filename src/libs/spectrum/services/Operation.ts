interface OperationOptions {
  name: string;
  getParams?: { [key: string]: any };
  postParams?: { [key: string]: any };
  forcePost?: boolean;
  paramsSeparator?: string;
  queryStartCharacter?: string;
  postType?: string;
  responseType?: string | null;
  trueValue?: string;
  falseValue?: string;
}

export class Operation {
  options: OperationOptions;

  constructor(name: string, options?: Partial<OperationOptions>) {
    this.options = {
      forcePost: false,
      paramsSeparator: ";",
      queryStartCharacter: ";",
      trueValue: "true",
      falseValue: "false",
      postType: "application/json",
      responseType: null,
      ...options,
      name: name,
    };

    this.options.getParams = this.options.getParams || {};
    this.options.postParams = this.options.postParams || {};
  }

  getUrlQuery(): string {
    const keyValueArray = [];
    const params = this.options.getParams;
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const param = params[key];
        keyValueArray.push(key + "=" + this._parseValue(param));
      }
    }
    let query = this.options.name;

    if (keyValueArray.length > 0) {
      query +=
        this.options.queryStartCharacter +
        keyValueArray.join(this.options.paramsSeparator);
    }

    return query;
  }

  getPostData(): string {
    return JSON.stringify(this.options.postParams);
  }

  getPostType(): string {
    return this.options.postType || "application/json";
  }

  getResponseType() {
    return this.options.responseType;
  }

  isPostOperation(): boolean {
    return (
      (this.options.postParams &&
        Object.keys(this.options.postParams).length !== 0) ||
      this.options.forcePost ||
      false
    );
  }

  private _parseValue(value: any): string {
    if (value === true) {
      return this.options.trueValue || "true";
    }

    if (value === false) {
      return this.options.falseValue || "false";
    }

    return encodeURIComponent(value);
  }
}
