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
  console.log("fetchCurrentUser: Starting to fetch current user");
  userStore.currentUser = { type: "Loading" };

  console.log("fetchCurrentUser: Getting session");
  const gotSession = await userApi.session.get();

  if (gotSession.type === "Err") {
    console.log(
      "fetchCurrentUser: Session error, user is logged out",
      gotSession.error
    );
    userStore.currentUser = { type: "LoggedOut" };
    return gotSession;
  }

  console.log(
    "fetchCurrentUser: Session found, user ID:",
    gotSession.data.userId
  );
  const currentUserLoading: UserStore["currentUser"] = {
    type: "LoggedIn",
    userId: gotSession.data.userId,
    status: { type: "Loading" },
  };

  userStore.currentUser = currentUserLoading;

  console.log("fetchCurrentUser: Getting user details");
  const gotUser = await userApi.user.get({ userId: gotSession.data.userId });

  if (gotUser.type === "Err") {
    console.log("fetchCurrentUser: Error getting user details", gotUser.error);
    const currentUserErr: UserStore["currentUser"] = {
      type: "LoggedIn",
      userId: currentUserLoading.userId,
      status: { type: "Err", error: gotUser.error },
    };
    userStore.currentUser = currentUserErr;
    return gotUser;
  }

  console.log(
    "fetchCurrentUser: Successfully retrieved user details",
    gotUser.data
  );
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
