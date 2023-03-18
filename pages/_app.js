import "../styles/globals.css";
import { SocketProvider } from "../context/socketProvider";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>CampusConnect</title>
      </Head>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  );
}

export default MyApp;
