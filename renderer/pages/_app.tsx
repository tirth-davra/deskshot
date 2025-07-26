import React, { useEffect } from "react";
import type { AppProps } from "next/app";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Apply dark mode class to document body
    document.documentElement.classList.add("dark");
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
