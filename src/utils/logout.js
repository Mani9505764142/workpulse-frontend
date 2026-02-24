// src/utils/logout.js
export function forceLogout() {
  localStorage.clear();

  window.location.href =
    "https://us-east-1xklaetj5h.auth.us-east-1.amazoncognito.com/logout" +
    "?client_id=rcqt06dpk77uds93d8pontkjm" +
    "&logout_uri=http://localhost:5173/";
}
