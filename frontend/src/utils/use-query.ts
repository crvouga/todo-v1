import { computed, onMounted, ref, watch, type Ref } from "vue";
import type { Result } from "./result";

type Loading = { type: "Loading" };

type NotAsked = { type: "NotAsked" };

type MutationStatus<TParams, TError, TData> =
  | NotAsked
  | (Loading & { params: TParams })
  | (Result<TError, TData> & { params: TParams });

type QueryStatus<TError, TData> = Loading | Result<TError, TData>;

export const useQuery = <TError, TData>({
  queryKey,
  queryFn,
}: {
  queryKey: Ref<string>;
  queryFn: () => Promise<Result<TError, TData>>;
}) => {
  const initial: Loading = { type: "Loading" };
  const status: Ref<QueryStatus<TError, TData>> = ref(initial);

  const run = async () => {
    status.value = { type: "Loading" };
    const result = await queryFn();
    status.value = result;
  };

  onMounted(() => {
    run();
  });

  const isLoading = computed(() => status.value.type === "Loading");
  const isErr = computed(() => status.value.type === "Err");
  const isOk = computed(() => status.value.type === "Ok");
  const data = computed(() =>
    status.value.type === "Ok" ? status.value.data : undefined
  );

  const mapOk = <T>(fallback: T, mapper: (data: TData) => T): Ref<T> =>
    computed(() => {
      if (status.value.type === "Ok") {
        return mapper(status.value.data);
      }
      return fallback;
    });

  const mapErr = <T>(fallback: T, mapper: (error: TError) => T): Ref<T> =>
    computed(() => {
      if (status.value.type === "Err") {
        return mapper(status.value.error);
      }
      return fallback;
    });

  watch(queryKey, () => {
    run();
  });

  const refetch = () => {
    run();
  };

  return {
    status,
    isErr,
    isLoading,
    isOk,
    data,
    mapOk,
    mapErr,
    refetch,
  };
};

export const useMutation = <TParams, TError, TData>({
  mutationFn,
  onErr,
  onOk,
}: {
  mutationFn: (params: TParams) => Promise<Result<TError, TData>>;
  onErr?: () => void;
  onOk?: () => void;
}) => {
  const initial: NotAsked = { type: "NotAsked" };

  const status: Ref<MutationStatus<TParams, TError, TData>> = ref(initial);

  const mutate = async (params: TParams) => {
    status.value = { type: "Loading", params };
    const result = await mutationFn(params);
    status.value = { ...result, params };
  };

  const isLoading = computed(() => status.value.type === "Loading");
  const isErr = computed(() => status.value.type === "Err");
  const isOk = computed(() => status.value.type === "Ok");
  const data = computed(() =>
    status.value.type === "Ok" ? status.value.data : undefined
  );

  const mapOk = <T>(fallback: T, mapper: (data: TData) => T): Ref<T> =>
    computed(() => {
      if (status.value.type === "Ok") {
        return mapper(status.value.data);
      }
      return fallback;
    });

  const mapErr = <T>(fallback: T, mapper: (error: TError) => T): Ref<T> =>
    computed(() => {
      if (status.value.type === "Err") {
        return mapper(status.value.error);
      }
      return fallback;
    });

  const mapParams = <T>(fallback: T, mapper: (params: TParams) => T): Ref<T> =>
    computed(() => {
      if (status.value.type === "NotAsked") {
        return fallback;
      }

      return mapper(status.value.params);
    });

  watch(status, () => {
    if (status.value.type === "Ok" && onOk) {
      onOk();
    }

    if (status.value.type === "Err" && onErr) {
      onErr();
    }
  });

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
