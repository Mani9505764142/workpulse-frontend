export function logout() {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const logoutRedirect = window.location.origin + "/";

  // clear app state
  localStorage.clear();

  // kill Cognito session
  window.location.href =
    `${domain}/logout` +
    `?client_id=${clientId}` +
    `&logout_uri=${encodeURIComponent(logoutRedirect)}`;
}
