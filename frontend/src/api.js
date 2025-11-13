import axios from "axios";

const API = axios.create({
  baseURL: "https://nextstop-app-u9cvd.ondigitalocean.app/",
});

export default API;
