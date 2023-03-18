import "../styles/globals.css";
import { SocketProvider } from "../context/socketProvider";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  );
}

export default MyApp;
