import { useState, useEffect } from "react";
import { useSocket } from "../context/socketProvider";
export default function Admin() {
  const [requests, setRequests] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("newIncomingMessage", (msg) => {
        setRequests((requests) => [...requests, `New order for ${msg}`]);
      });
    }
  }, [socket]);
  return (
    <div>
      {requests &&
        requests?.map(function (value) {
          return <p key={value}>{value}</p>;
        })}
      {requests.length == 0 && <p>No requests yet</p>}
    </div>
  );
}
