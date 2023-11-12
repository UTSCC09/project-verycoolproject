"use client";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import App from "./App";
import Login from "../pages/login/login";

function HomePage() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default HomePage;


