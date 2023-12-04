import { Service } from "./Service";
import { Operation } from "./Operation";

export interface FeatureCountOptions {
  q?: string;
  point?: string;
  tolerance?: string;
  geometryAttributeName?: string;
  l?: string;
}

export interface SearchAtPointOptions {
  attributes?: string[];
  orderBy?: string;
  tolerance?: string;
  geometryAttributeName?: string;
  page?: string;
  pageLength?: string;
  l?: string;
}

export interface SearchNearestOptions {
  attributes?: string;
  orderBy?: string;
  withinDistance?: string;
  distanceAttributeName?: string;
  geometryAttributeName?: string;
  page?: string;
  pageLength?: string;
  l?: string;
  maxFeatures?: string;
}

interface SearchSQLOptions {
  page?: string;
  pageLength?: string;
  l?: string;
}

export class FeatureService extends Service {
  tableList(locale?: string) {
    const operation = new Operation("tables.json");

    if (locale) {
      const params = operation.options.getParams;
      operation.options.getParams = { ...params, l: locale };
    }

    return this.startRequest(operation);
  }

  count(locale?: string) {
    const operation = new Operation("tables/count");

    if (locale) {
      const params = operation.options.getParams;
      operation.options.getParams = { ...params, l: locale };
    }

    return this.startRequest(operation);
  }

  featureCount(tableName: string, options?: FeatureCountOptions) {
    const operation = new Operation(
      `tables/${this.clearParam(tableName)}/features/count`,
      {
        paramsSeparator: "&",
        queryStartCharacter: "?",
      }
    );

    operation.options.getParams = {
      ...operation.options.getParams,
      ...options,
    };

    return this.startRequest(operation);
  }

  describe(tableName: string, locale?: string) {
    const operation = new Operation(
      `tables/${this.clearParam(tableName)}/metadata.json`
    );

    if (locale) {
      const params = operation.options.getParams;
      operation.options.getParams = { ...params, l: locale };
    }

    return this.startRequest(operation);
  }

  insert(tableName: string, features: Object, commitInterval?: number) {
    const operation = new Operation(
      `tables/${this.clearParam(tableName)}/features.json`,
      {
        paramsSeparator: "&",
        queryStartCharacter: "?",
      }
    );

    const getParams = operation.options.getParams ?? {};

    getParams.action = "insert";

    if (commitInterval) {
      getParams.commitInterval = commitInterval;
    }

    operation.options.postParams = features;
    operation.options.getParams = getParams;

    return this.startRequest(operation);
  }

  searchAtPoint(
    tableName: string,
    point: { x: number; y: number },
    srs: string,
    options?: SearchAtPointOptions
  ) {
    const operation = new Operation(
      `tables/${this.clearParam(tableName)}/features.json`,
      {
        paramsSeparator: "&",
        queryStartCharacter: "?",
      }
    );

    const getParams = operation.options.getParams ?? {};

    getParams.q = "searchAtPoint";
    getParams.point = point.x + "," + point.y + "," + srs;

    operation.options.getParams = { ...getParams, ...options };

    return this.startRequest(operation);
  }

  searchNearest(
    tableName: string,
    geometry: Object,
    options?: SearchNearestOptions
  ) {
    const operation = new Operation(
      `tables/${this.clearParam(tableName)}/features.json`,
      {
        paramsSeparator: "&",
        queryStartCharacter: "?",
      }
    );

    const getParams = operation.options.getParams ?? {};

    getParams.q = "searchNearest";
    getParams.geometry = JSON.stringify(geometry);

    operation.options.getParams = { ...getParams, ...options };

    return this.startRequest(operation);
  }

  searchId(
    tableName: string,
    id: string,
    attributes?: string,
    locale?: string
  ) {
    const operation = new Operation(
      `tables/${this.clearParam(tableName)}/features.json` +
        (attributes ? `;attributes=${attributes}` : "") +
        (locale ? `;l=${locale}` : "") +
        `/${id}`
    );

    return this.startRequest(operation);
  }

  searchSQL(query: string, options?: SearchSQLOptions) {
    const operation = new Operation("tables/features.json", {
      paramsSeparator: "&",
      queryStartCharacter: "?",
    });

    const getParams = operation.options.getParams ?? {};

    getParams.q = query;

    operation.options.getParams = { ...getParams, ...options };

    return this.startRequest(operation);
  }

  update(tableName: string, features: Object, commitInterval?: number) {
    const operation = new Operation(
      `tables/${this.clearParam(tableName)}/features.json`,
      {
        paramsSeparator: "&",
        queryStartCharacter: "?",
      }
    );

    const getParams = operation.options.getParams ?? {};

    getParams.action = "update";

    if (commitInterval) {
      getParams.commitInterval = commitInterval;
    }

    operation.options.postParams = features;

    operation.options.getParams = getParams;

    return this.startRequest(operation);
  }

  updateSQL(query: string, boundParams?: Object, locale?: string) {
    const operation = new Operation("tables/features.json", {
      paramsSeparator: "&",
      queryStartCharacter: "?",
    });

    const getParams = operation.options.getParams ?? {};

    getParams.update = query;

    if (locale) {
      getParams.l = locale;
    }

    operation.options.getParams = getParams;

    if (boundParams) {
      operation.options.postParams = boundParams;
    }

    return this.startRequest(operation);
  }
}
