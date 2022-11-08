import { reactive } from "vue";
import userApi from "./user-api";
import { applyUserPatch, type User, type UserPatchBody } from "./user-shared";

export type CurrentUserStatus =
  | { type: "Loading" }
  | { type: "Err"; error: string }
  | { type: "Ok"; user: User };

type UserStore = {
  currentUser:
    | { type: "Loading" }
    | { type: "LoggedOut" }
    | { type: "LoggedIn"; userId: string; status: CurrentUserStatus };
};

export const userStore = reactive<UserStore>({
  currentUser: {
    type: "Loading",
  },
});

export const getCurrentUserId = (): string | null => {
  if (userStore.currentUser.type === "LoggedIn") {
    return userStore.currentUser.userId;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  if (
    userStore.currentUser.type === "LoggedIn" &&
    userStore.currentUser.status.type === "Ok"
  ) {
    return userStore.currentUser.status.user;
  }
  return null;
};

export const fetchCurrentUser = async () => {
  userStore.currentUser = { type: "Loading" };

  const gotSession = await userApi.session.get();

  if (gotSession.type === "Err") {
    userStore.currentUser = { type: "LoggedOut" };
    return gotSession;
  }

  const currentUserLoading: UserStore["currentUser"] = {
    type: "LoggedIn",
    userId: gotSession.data.userId,
    status: { type: "Loading" },
  };

  userStore.currentUser = currentUserLoading;

  const gotUser = await userApi.user.get({ userId: gotSession.data.userId });

  if (gotUser.type === "Err") {
    const currentUserErr: UserStore["currentUser"] = {
      type: "LoggedIn",
      userId: currentUserLoading.userId,
      status: { type: "Err", error: gotUser.error },
    };
    userStore.currentUser = currentUserErr;
    return gotUser;
  }

  const currentUserOk: UserStore["currentUser"] = {
    type: "LoggedIn",
    userId: currentUserLoading.userId,
    status: { type: "Ok", user: gotUser.data },
  };

  userStore.currentUser = currentUserOk;

  return gotUser;
};

export const patchCurrentUser = (body: UserPatchBody) => {
  if (
    userStore.currentUser.type === "LoggedIn" &&
    userStore.currentUser.status.type === "Ok"
  ) {
    const user = userStore.currentUser.status.user;
    userStore.currentUser.status.user = applyUserPatch(user, body);
  }
};
