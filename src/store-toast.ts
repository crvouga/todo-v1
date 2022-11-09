import { v4 } from "uuid";
import { reactive } from "vue";

export type Store = {
  toast: Toast | { type: "None" };
};

export type Toast = {
  id: string;
  type: "Error" | "Info" | "Success";
  title: string;
};

export const store = reactive<Store>({
  toast: { type: "None" },
});

const defaultDuration = 3_000;

export const showToast = async (toast: Omit<Toast, "id">) => {
  if (store.toast.type !== "None") {
    store.toast = { type: "None" };
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const toastNew: Toast = { ...toast, id: v4() };
  store.toast = toastNew;

  await new Promise((resolve) => setTimeout(resolve, defaultDuration));

  if (store.toast.id === toastNew.id) {
    store.toast = { type: "None" };
  }
};

export const getToast = (): Store["toast"] => {
  return store.toast;
};
