import axios, { AxiosError } from "axios";

type OnThenCallback<T> = (response: T) => any;
type OnCatchCallback<T> = (error: T) => any;
type OnFinallyCallback = () => any;

export default function useApi() {
  /** wrapOnCatch is created to always agree on handling the error if it is an "AxiosError" */
  const wrapOnCatch = onCatch => (e: AxiosError) => {
    if (!axios.isAxiosError(e)) {
      // maybe handle other errors?
      return console.error("Unexpected error:", e);
    }
    onCatch(e);
  };

  function getData<TResponseData>(
    endpoint: string,
    onThen: OnThenCallback<TResponseData> = undefined,
    onCatch: OnCatchCallback<AxiosError> = undefined,
    onFinally: OnFinallyCallback = undefined
  ) {
    axios
      .get<TResponseData>(endpoint)
      .then(({ data }) => onThen(data))
      .catch(wrapOnCatch(onCatch))
      .finally(onFinally);
  }

  function postData<TResponseData>(
    endpoint: string,
    data: any = undefined,
    onThen: OnThenCallback<TResponseData> = undefined,
    onCatch: OnCatchCallback<AxiosError> = undefined,
    onFinally: OnFinallyCallback = undefined
  ) {
    axios
      .post<TResponseData>(endpoint, data)
      .then(({ data }) => onThen(data))
      .catch(wrapOnCatch(onCatch))
      .finally(onFinally);
  }

  function patchData<TResponseData>(
    endpoint: string,
    data: any = undefined,
    onThen: OnThenCallback<TResponseData> = undefined,
    onCatch: OnCatchCallback<AxiosError> = undefined,
    onFinally: OnFinallyCallback = undefined
  ) {
    axios
      .patch<TResponseData>(endpoint, data)
      .then(({ data }) => onThen(data))
      .catch(wrapOnCatch(onCatch))
      .finally(onFinally);
  }

  function deleteData<TResponseData>(
    endpoint: string,
    onThen: OnThenCallback<TResponseData> = undefined,
    onCatch: OnCatchCallback<AxiosError> = undefined,
    onFinally: OnFinallyCallback = undefined
  ) {
    axios
      .delete<TResponseData>(endpoint)
      .then(({ data }) => onThen(data))
      .catch(wrapOnCatch(onCatch))
      .finally(onFinally);
  }

  return { getData, postData, patchData, deleteData };
}
