import style from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import pptx from "pptxgenjs";
import { useSocket } from "../context/socketProvider";
import Image from "next/image";
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [list, setList] = useState([]);
  const [requests, setRequests] = useState([]);
  const socket = useSocket();
  useEffect(() => {
    if (localStorage.getItem("list")) {
      setList(localStorage.getItem("list").split(","));
    }
  }, []);

  const broadCastMessage = async (msg) => {
    socket.emit("createdMessage", msg);
  };

  const vanTimes = [
    "7:05",
    "7:40",
    "9:20",
    "10:10",
    "11:15",
    "12:05",
    "13:05",
    "14:05",
    "15:15",
    "16:15",
    "17:00",
    "17:45",
    "18:30",
    "19:10",
    "20:15",
    "21:15",
    "22:15",
    "23:15",
  ];

  async function sendMessage() {
    const text = document.getElementById("messageInput").value;

    const data = {
      prompt: text,
    };

    document.getElementById("messageInput").value = "";

    const message = {
      role: "user",
      content: text,
    };

    setMessages((messages) => [...messages, message]);

    const lower = text.toLowerCase();
    const check = lower.replace(/\s/g, "");

    //Pre-defined responses
    if (check.includes("yourname")) {
      addQuestion("My name is ConnectBot");
    } else if (check.includes("van")) {
      if (check.includes("nextvan")) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Find the next van departure time after the current time
        let nextVanTime = null;
        for (let i = 0; i < vanTimes.length; i++) {
          const [vanHour, vanMinute] = vanTimes[i].split(":").map(Number);
          if (
            vanHour > currentHour ||
            (vanHour === currentHour && vanMinute > currentMinute)
          ) {
            nextVanTime = vanTimes[i];
            break;
          }
        }

        // Display the next van departure time (if found)
        if (nextVanTime) {
          const [nextVanHour, nextVanMinute] = nextVanTime
            .split(":")
            .map(Number);
          const timeUntilNextVan =
            ((nextVanHour - currentHour) * 60 +
              (nextVanMinute - currentMinute)) *
            60 *
            1000;
          addQuestion(
            `The next van leaves AUI at ${nextVanTime}. That is in about ${
              timeUntilNextVan / 1000 / 60
            } minutes. `
          );
        } else {
          addQuestion("There are no more van departures today.");
        }
      }
    } else if (check.includes("firstvan")) {
      addQuestion("The first van leaves AUI at 7:05 AM");
    } else if (check.includes("lastvan")) {
      addQuestion("The last van leaves AUI at 23:15 PM");
    } else {
      await fetch("/api/classifyPrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(async (res) => {
        const category = await res.text();
        const lowerCase = category.toLowerCase();
        if (lowerCase.includes("none")) {
          const send = { messages: [...messages, message] };

          const response = await fetch("/api/askQuestion", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(send),
          }).then(async (res) => {
            return await res.text();
          });

          addQuestion(response);
        } else if (lowerCase.includes("food") || lowerCase.includes("order")) {
          if (check.includes("sandwich")) {
            addQuestion("Ordering a sandwhich");
            addOrder("sandwich");
          } else if (check.includes("pizza")) {
            addQuestion("Ordering a pizza");
            addOrder("pizza");
          } else if (check.includes("burger")) {
            addQuestion("Ordering a burger");
            addOrder("burger");
          } else if (check.includes("drink")) {
            addQuestion("Ordering a drink");
            addOrder("drink");
          } else {
            addQuestion("That is not an item on the menu");
          }
        } else if (lowerCase.includes("presentation")) {
          let words = text.split("on")[2];

          if (words == undefined) {
            words = text.split("about")[1];
          }

          addQuestion(
            `Generating presentation on ${words}. This may take a while...`
          );

          const send = {
            topic: words,
            type: "detailed",
          };

          const content = await fetch("/api/generateAICourse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(send),
          }).then(async (res) => {
            return res.text();
          });
          console.log(content);
          generateContent(words, content);
        } else if (lowerCase.includes("event")) {
          addQuestion(`The upcoming events inlclude: 

                The regional robotic Olympiad, 

                Agadir – Essaouira, Morocco http://www.ieee.ma/cist23/special-invited-sessions/scis   The 5th ...At From 16 Dec 23 09:00 to 22 Dec 23 18:00 Hosted by Academic Events Details
                
                The First Spring University: Education Values and Value EducationImportant information and links: Submission ...At Al Akhawayn University in Ifrane, Morocco From 28 May 23 09:00 to 03 Jun 23 18:00 Hosted by AUI

                Regional Robotics Olympiad, 4th edition

                The 3rd edition of the Moroccan Robotic Competition "AUROBAT'2023"The Moroccan Robotics Competition AUROBAT'2023, 3At Auditorium 4 From 18 Mar 23 09:00 to 19 Mar 23 20:00 Hosted by SSE, AUI CITI-Association Association, ATDTec, AUI Mechatronic club

                The MORHEL Project's kick-off meetingThe MORHEL Project's kick-off meeting will take place on 1-3 March 2023 at the ACC in Ifrane. 
                `);
        } else if (lowerCase.includes("task")) {
          const lowercase = text.toLowerCase();

          const word = lowercase.split("add").pop().split("to")[0];
          addQuestion(`Adding ${word} to your task planner`);
          setList((list) => [...list, word]);
          localStorage.setItem("list", [...list, word]);
        }
      });
    }
  }

  function addOrder(value) {
    setRequests((requests) => [...requests, value]);
    broadCastMessage(value);
  }

  async function generateContent(prompt, content) {
    const ppt = new pptx();

    let titleOpt = {
      x: 1.5,
      y: 1,
      fontSize: 48,
      color: "ffffff",
    };
    let subTitleOpt = { x: 1.5, y: 2, fontSize: 24, color: "ffffff" };

    let title = ppt.addSlide();
    title.background = { fill: "00cba9" };
    title.addText(prompt, titleOpt);
    title.addText("By: NoteBot (The NoteSwap AI)", subTitleOpt);

    let opts1 = {
      x: 0.0,
      y: 0.0,
      w: "100%",
      h: 1.6,
      align: "center",
      fontSize: 23,
      color: "FFFFFF",
      fill: "00cba9",
    };
    let opts2 = {
      x: 0.0,
      y: 3,
      w: "100%",
      h: 1.4,
      align: "center",
      fontSize: 12,
    };

    let slides = content.split("§");
    slides.slice(0, 1);

    for (let i = 0; i < slides.length; i++) {
      if (i != 0 && i != 1) {
        if (slides[i - 1]?.length < slides[i].length) {
          let slide = ppt.addSlide();
          slide.addText(
            slides[i - 1]?.substring(slides[i - 1]?.indexOf(":") + 1),
            opts1
          );
          slide.addText(slides[i], opts2);
        }
      }
    }

    let conclusion = ppt.addSlide();
    conclusion.background = { fill: "00cba9" };
    conclusion.addText("End of presentation", titleOpt);

    ppt.writeFile();

    addQuestion("Finished generating the presentation");
  }

  async function addQuestion(value) {
    setMessages((messages) => [
      ...messages,
      {
        role: "assistant",
        content: value,
      },
    ]);
    say(value);
  }

  function record() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = new SpeechRecognition();

    recognition.onstart = () => {
      console.log("starting listening, speak in microphone");
    };

    recognition.onspeechend = () => {
      console.log("stopped listening");
      recognition.stop();
    };

    recognition.onresult = (result) => {
      let vocalInput = result.results[0][0].transcript;
      document.getElementById("messageInput").value = vocalInput;
    };

    if (recording) {
      setRecording(false);
      recognition.stop();
    } else {
      setRecording(true);
      recognition.start();
    }
  }
  function removeElement(value) {
    const index = list.indexOf(value);
    if (index > -1) {
      // only splice array when item is found
      list.splice(index, 1);
      setList(list);
      localStorage.setItem("list", list);
      document.getElementById(value).style.display = "none";
    }
  }

  function say(text) {
    if ("speechSynthesis" in window) {
      var msg = new SpeechSynthesisUtterance();
      msg.text = text;
      window.speechSynthesis.speak(msg);
    }
  }

  return (
    <div className={style.main}>
      <section id="sideBar" className={style.sideBar}>
        <h1>Task Planner</h1>
        <ul>
          {list &&
            list?.map(function (value) {
              return (
                <li id={value} key={value} onClick={() => removeElement(value)}>
                  {value}
                </li>
              );
            })}
        </ul>

        <h1>Ongoing Requests</h1>
        <ul>
          {requests &&
            requests?.map(function (value) {
              return <li key={value}>{value}</li>;
            })}
        </ul>
      </section>
      <div className={style.container}>
        <section className={style.title}>
          <h1>Campus</h1>
          <h2>Connect</h2>
        </section>
        <section id="messageContainer" className={style.messageContainer}>
          {messages &&
            messages?.map(function (index) {
              return (
                <p>
                  <b>{index.role == "user" ? "You" : "ConnectBot"}</b>:{" "}
                  {index.content}
                </p>
              );
            })}
        </section>
        <section className={style.input}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              id="messageInput"
              placeholder="Enter your text"
              required
            ></input>
            <button
              type="button"
              className={style.record}
              onClick={() => record()}
            >
              {" "}
              <Image
                width={14}
                height={20}
                alt="Microphone"
                src="/microphone.png"
              ></Image>
            </button>
            <button type="submit">Send</button>
          </form>
        </section>
      </div>
    </div>
  );
}
