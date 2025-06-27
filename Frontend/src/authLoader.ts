import { redirect } from "react-router-dom";

export function authLoader() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return redirect("/login");
  }
  return null;
}
