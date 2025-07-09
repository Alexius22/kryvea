import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { IdObject } from "../types/common.types";

type OnThenCallback<T> = (response: T) => any;
type OnCatchCallback<T> = (error: T) => any;
type OnFinallyCallback = () => any;
type HttpErrorData = {
  error: string;
};

const UNKNOWN_HTTP_ERROR_CAUSE = "Unknown error";

const defaultHandleCatch: OnCatchCallback<AxiosError<HttpErrorData>> = err =>
  toast.error(err.response?.data.error || UNKNOWN_HTTP_ERROR_CAUSE);

export function getData<TResponseData>(
  endpoint: string,
  onThen: OnThenCallback<TResponseData> = undefined,
  onCatch: OnCatchCallback<AxiosError<HttpErrorData>> = defaultHandleCatch,
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
  onCatch: OnCatchCallback<AxiosError<HttpErrorData>> = defaultHandleCatch,
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
  onCatch: OnCatchCallback<AxiosError<HttpErrorData>> = defaultHandleCatch,
  onFinally: OnFinallyCallback = undefined
) {
  axios
    .patch<TResponseData>(endpoint, data)
    .then(({ data }) => onThen(data))
    .catch(onCatch)
    .finally(onFinally);
}

export function putData<TResponseData>(
  endpoint: string,
  data: any = undefined,
  onThen: OnThenCallback<TResponseData> = undefined,
  onCatch: OnCatchCallback<AxiosError<HttpErrorData>> = defaultHandleCatch,
  onFinally: OnFinallyCallback = undefined
) {
  axios
    .put<TResponseData>(endpoint, data)
    .then(({ data }) => onThen(data))
    .catch(onCatch)
    .finally(onFinally);
}

export function deleteData<TResponseData>(
  endpoint: string,
  onThen: OnThenCallback<TResponseData> = undefined,
  onCatch: OnCatchCallback<AxiosError<HttpErrorData>> = defaultHandleCatch,
  onFinally: OnFinallyCallback = undefined
) {
  axios
    .delete<TResponseData>(endpoint)
    .then(({ data }) => onThen(data))
    .catch(onCatch)
    .finally(onFinally);
}

export function autoUpdateArrState(setState) {
  return (data: IdObject) => {
    console.log("data =", data);

    setState((prev: IdObject[]) => {
      if (!Array.isArray(prev)) {
        console.error("Expected previous state to be an array");
        return prev;
      }

      prev.map(item => {
        if (item.id !== data.id) {
          return item;
        }
        return { ...data };
      });
    });
  };
}
