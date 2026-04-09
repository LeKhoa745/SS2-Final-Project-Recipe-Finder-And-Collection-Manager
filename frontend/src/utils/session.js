export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function setSession({ accessToken, user }) {
  if (typeof accessToken === "string") {
    localStorage.setItem("accessToken", accessToken);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  window.dispatchEvent(new CustomEvent("session:changed"));
}

export function updateStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("session:changed"));
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("session:changed"));
}
