import {
  applyPatch,
  TodoItem,
  TodoItemDeleteParams,
  TodoItemPatch,
  TodoItemPatchParams,
  type TodoItemGetParams,
} from "../todo-list-shared";
import { ref } from "vue";
import TodoItemApi from "../todo-list-item-api";

type Status<TParams, TError, TData> =
  | { type: "NotAsked" }
  | { type: "Loading"; params: TParams }
  | { type: "Ok"; params: TParams; data: TData }
  | { type: "Err"; params: TParams; error: TError };

const notAsked: { type: "NotAsked" } = { type: "NotAsked" };

export const useTodoItems = () => {
  // this should be a key value collection here
  const todoItems = ref<TodoItem[]>([]);
  const statusGet =
    ref<Status<TodoItemGetParams, string, TodoItem[]>>(notAsked);
  const statusDelete =
    ref<Status<TodoItemDeleteParams, string, null>>(notAsked);
  const statusPatch = ref<Status<TodoItemPatchParams, string, null>>(notAsked);
  const statusPost = ref<Status<{}, string, null>>(notAsked);

  const get = async (params: TodoItemGetParams) => {
    if (statusGet.value.type === "Loading") {
      return;
    }
    statusGet.value = { type: "Loading", params };

    const result = await TodoItemApi.get(params);

    if (result.type === "Err") {
      statusGet.value = { type: "Err", params, error: result.error };

      return;
    }

    todoItems.value = todoItems.value
      .filter((item) =>
        result.data.items.every((newItem) => newItem.id !== item.id)
      )
      .concat(result.data.items);
    statusGet.value = { type: "Ok", params, data: result.data.items };
  };

  const delete_ = async (params: TodoItemDeleteParams) => {
    if (statusDelete.value.type === "Loading") {
      return;
    }

    statusDelete.value = { type: "Loading", params };

    const result = await TodoItemApi.delete_(params);

    if (result.type === "Err") {
      statusDelete.value = { type: "Err", params, error: result.error };
      return;
    }

    todoItems.value = todoItems.value.filter(
      (item) => item.id !== params.itemId
    );
    statusDelete.value = { type: "NotAsked" };
  };

  const patch = async (params: TodoItemPatchParams, body: TodoItemPatch) => {
    if (statusPatch.value.type === "Loading") {
      return;
    }

    statusPatch.value = { type: "Loading", params };

    const result = await TodoItemApi.patch({ params, body });

    if (result.type === "Err") {
      statusPatch.value = { type: "Err", params, error: result.error };
      return;
    }

    todoItems.value = todoItems.value.map((item) => {
      if (item.id === params.itemId) {
        const cleaned = TodoItemPatch.safeParse(body);
        const patched = cleaned.success ? applyPatch(item, cleaned.data) : item;
        return patched;
      }
      return item;
    });

    statusPatch.value = { type: "Ok", data: null, params };
  };

  const post = async ({ text, listId }: { text: string; listId: string }) => {
    if (statusPost.value.type === "Loading") {
      return;
    }
    statusPost.value = { type: "Loading", params: {} };
    const result = await TodoItemApi.post({ listId, text });
    if (result.type === "Err") {
      statusPost.value = { type: "Err", params: {}, error: result.error };
      return;
    }

    todoItems.value = [...todoItems.value, result.data];
    statusPost.value = { type: "Ok", params: {}, data: null };
  };

  return {
    todoItems,
    statusGet,
    statusDelete,
    statusPatch,
    statusPost,
    get,
    post,
    patch,
    delete_,
  };
};
