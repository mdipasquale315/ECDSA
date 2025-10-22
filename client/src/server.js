import axios from "axios";

const server = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3042",
  adapter: require("axios/lib/adapters/xhr") // use browser XHR adapter
});

export default server;
