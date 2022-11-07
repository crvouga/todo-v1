import { v4 } from "uuid";
import { reactive } from "vue";

//
//
//

export type Store = {
  toast: Toast | { type: "None" };
};

export type Toast =
  | {
      id: string;
      type: "Error";
      title: string;
    }
  | {
      id: string;
      type: "Info";
      title: string;
    };

//
//
//

export const store = reactive<Store>({
  toast: { type: "None" },
});

const defaultDuration = 3_000;

export const showToast = (toast: Omit<Toast, "id">) => {
  const toastNew: Toast = { ...toast, id: v4() };
  store.toast = toastNew;
  setTimeout(() => {
    if (store.toast.type !== "None" && store.toast.id === toastNew.id) {
      store.toast = { type: "None" };
    }
  }, defaultDuration);
};
