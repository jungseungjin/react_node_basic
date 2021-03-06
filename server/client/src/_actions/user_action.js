import axios from "axios";
import { LOGIN_USER, REGISTER_USER, AUTH_USER } from "./types";
export function loginUser(dataToSubmit) {
  const request = axios
    .post("/api/users/login", dataToSubmit)
    .then((response) => response.data); //response.data를 request에 넣는다
  return {
    type: LOGIN_USER,
    payload: request,
  };
}

export function registerUser(dataToSubmit) {
  const request = axios
    .post("/api/users/register", dataToSubmit)
    .then((response) => response.data); //response.data를 request에 넣는다

  return {
    type: REGISTER_USER,
    payload: request,
  };
}
export function auth(dataToSubmit) {
  const request = axios
    .get("/api/users/auth", dataToSubmit)
    .then((response) => response.data); //response.data를 request에 넣는다

  return {
    type: AUTH_USER,
    payload: request,
  };
}
