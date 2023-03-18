/* Socket provider used for the client side */

//Import from react
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
//Import the socket.io client version
import io from "socket.io-client";
//Create a new contect
const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ id, children }) {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const dev = process.env.NODE_ENV !== "production";

    const server = dev
      ? "https://noteswap-backend.onrender.com"
      : "https://noteswap-backend.onrender.com";
    //Set up a new client with the server

    try {
      const newSocket = io(server, {
        query: `chat=food`,
        path: "/socket.io",
        transports: ["websocket", "polling"],
        secure: true,
      });
      setSocket(newSocket);
      return () => newSocket.close();
    } catch (err) {
      console.log(err);
      return;
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
