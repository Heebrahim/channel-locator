export type APIRes<T = any> = {
  data: T;
};

export type ApiError = {
  error: string;
};
