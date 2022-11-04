import {
  applyPatch,
  TodoItem,
  TodoItemPatch,
  TodoItemPatchParams,
  type TodoItemGetParams,
} from "@/shared";
import { ref } from "vue";
import TodoItemApi from "./todo-item-api";

type State<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Success"; params: TParams; data: TData }
  | { type: "Failure"; params: TParams; error: TError };

const notAsked: { type: "NotAsked" } = { type: "NotAsked" };

export const useTodoItems = () => {
  // this should be a key value collection here
  const items = ref<TodoItem[]>([]);

  //
  //
  //

  const stateGet = ref<State<TodoItemGetParams, string, TodoItem[]>>(notAsked);

  const get = async (params: TodoItemGetParams) => {
    stateGet.value = { type: "Loading", params };

    const result = await TodoItemApi.get(params);

    if (result.type === "Err") {
      stateGet.value = { type: "Failure", params, error: result.error };

      return;
    }

    items.value = items.value
      .filter((item) =>
        result.data.items.every((newItem) => newItem.id !== item.id)
      )
      .concat(result.data.items);
    stateGet.value = { type: "Success", params, data: result.data.items };
  };

  //
  //
  //

  const stateDelete = ref<State<{ id: string }, string, null>>(notAsked);

  const delete_ = async (params: { id: string }) => {
    stateDelete.value = { type: "Loading", params };

    const result = await TodoItemApi.delete(params);

    if (result.type === "Err") {
      stateDelete.value = { type: "Failure", params, error: result.error };
      return;
    }

    items.value = items.value.filter((item) => item.id !== params.id);
    stateDelete.value = { type: "NotAsked" };
  };

  //
  //
  //

  const statePatch = ref<State<TodoItemPatchParams, string, null>>(notAsked);

  const patch = async (params: TodoItemPatchParams, body: TodoItemPatch) => {
    statePatch.value = { type: "Loading", params };

    const result = await TodoItemApi.patch({ params, body });

    if (result.type === "Err") {
      statePatch.value = { type: "Failure", params, error: result.error };
      return;
    }

    items.value = items.value.map((item) => {
      if (item.id === params.itemId) {
        const cleaned = TodoItemPatch.safeParse(body);
        const patched = cleaned.success ? applyPatch(item, cleaned.data) : item;
        return patched;
      }
      return item;
    });

    statePatch.value = { type: "Success", data: null, params };
  };

  //
  //
  //

  const statePost = ref<State<{}, string, null>>(notAsked);

  const post = async ({ text }: { text: string }) => {
    statePost.value = { type: "Loading", params: {} };
    const result = await TodoItemApi.post({ text });
    if (result.type === "Err") {
      statePost.value = { type: "Failure", params: {}, error: result.error };
      return;
    }

    items.value = [...items.value, result.data];
    statePost.value = { type: "Success", params: {}, data: null };
  };

  return {
    items,
    get,
    stateGet,
    delete_,
    stateDelete,
    patch,
    statePatch,
    post,
    statePost,
  };
};
