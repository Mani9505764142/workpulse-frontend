import { forceLogout } from "./logout";

export async function authFetch(url, options = {}) {
  const idToken = localStorage.getItem("idToken");

  if (!idToken) {
    forceLogout();
    return;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    forceLogout();
    return;
  }

  return res;
}
