import { ref, type Ref } from "vue";
import type { Result } from "./result";

type Loading = { type: "Loading" };

type NotAsked = { type: "NotAsked" };

type MutationStatus<TParams, TError, TData> =
  | NotAsked
  | (Loading & { params: TParams })
  | (Result<TError, TData> & { params: TParams });

type QueryStatus<TError, TData> = Loading | Result<TError, TData>;

export const useQuery = <TError, TData>({
  queryFn,
}: {
  queryFn: () => Promise<Result<TError, TData>>;
}) => {
  const status: Ref<QueryStatus<TError, TData>> = ref();

  const run = async () => {
    const result = await queryFn();
  };
};

export const useMutation = <TParams, TError, TData>(
  mutationFn: (params: TParams) => Promise<Result<TError, TData>>
) => {
  const initial: NotAsked = { type: "NotAsked" };

  const status: Ref<MutationStatus<TParams, TError, TData>> = ref(initial);

  const mutate = async (params: TParams) => {
    status.value = { type: "Loading", params };
    const result = await mutationFn(params);
    status.value = { ...result, params };
  };

  const isLoading = status.value.type === "Loading";
  const isErr = status.value.type === "Err";
  const isOk = status.value.type === "Ok";
  const data = status.value.type === "Ok" ? status.value.data : undefined;

  const mapOk = <T>(fallback: T, mapper: (data: TData) => T): T => {
    if (status.value.type === "Ok") {
      return mapper(status.value.data);
    }
    return fallback;
  };

  const mapErr = <T>(fallback: T, mapper: (error: TError) => T): T => {
    if (status.value.type === "Err") {
      return mapper(status.value.error);
    }
    return fallback;
  };

  const mapParams = <T>(fallback: T, mapper: (params: TParams) => T): T => {
    if (status.value.type === "NotAsked") {
      return fallback;
    }

    return mapper(status.value.params);
  };

  return {
    status,
    mutate,
    isErr,
    isOk,
    isLoading,
    data,
    mapOk,
    mapErr,
    mapParams,
  };
};
