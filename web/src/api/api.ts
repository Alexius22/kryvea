import axios, { AxiosError } from "axios";

type OnThenCallback<T> = (response: T) => any;
type OnCatchCallback<T> = (error: T) => any;
type OnFinallyCallback = () => any;

export function getData<TResponseData>(
  endpoint: string,
  onThen: OnThenCallback<TResponseData> = undefined,
  onCatch: OnCatchCallback<AxiosError> = undefined,
  onFinally: OnFinallyCallback = undefined
) {
  axios
    .get<TResponseData>(endpoint)
    .then(({ data }) => onThen(data))
    .catch(onCatch)
    .finally(onFinally);
}

export function postData<TResponseData>(
  endpoint: string,
  data: any = undefined,
  onThen: OnThenCallback<TResponseData> = undefined,
  onCatch: OnCatchCallback<AxiosError<any, any>> = undefined,
  onFinally: OnFinallyCallback = undefined
) {
  axios
    .post<TResponseData>(endpoint, data)
    .then(({ data }) => onThen(data))
    .catch(onCatch)
    .finally(onFinally);
}

export function patchData<TResponseData>(
  endpoint: string,
  data: any = undefined,
  onThen: OnThenCallback<TResponseData> = undefined,
  onCatch: OnCatchCallback<AxiosError> = undefined,
  onFinally: OnFinallyCallback = undefined
) {
  axios
    .patch<TResponseData>(endpoint, data)
    .then(({ data }) => onThen(data))
    .catch(onCatch)
    .finally(onFinally);
}

export function deleteData<TResponseData>(
  endpoint: string,
  onThen: OnThenCallback<TResponseData> = undefined,
  onCatch: OnCatchCallback<AxiosError> = undefined,
  onFinally: OnFinallyCallback = undefined
) {
  axios
    .delete<TResponseData>(endpoint)
    .then(({ data }) => onThen(data))
    .catch(onCatch)
    .finally(onFinally);
}
