import { reactive } from "vue";
import userSessionApi from "./user/user-session-api";

type Store = {
  currentUser:
    | { type: "Loading" }
    | { type: "LoggedIn"; userId: string }
    | { type: "LoggedOut" };
};

const store = reactive<Store>({
  currentUser: {
    type: "Loading",
  },
});

export const getCurrentUserId = (): string | null => {
  if (store.currentUser.type === "LoggedIn") {
    return store.currentUser.userId;
  }
  return null;
};

export const getSession = async () => {
  const result = await userSessionApi.get();
  if (result.type === "Err") {
    store.currentUser = { type: "LoggedOut" };
    return result;
  }
  store.currentUser = { type: "LoggedIn", userId: result.data.userId };
  return result;
};
