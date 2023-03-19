import "../styles/globals.css";
import { SocketProvider } from "../context/socketProvider";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>CampusConnect</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192" />
        <link rel="mask-icon" href="/icon-192x192" />
      </Head>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  );
}

export default MyApp;
