import "../styles/globals.css";
import { SocketProvider } from "../context/socketProvider";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>CampusConnect</title>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  );
}

export default MyApp;
