import { useEffect, useState } from "react";
import "../../style/dashboard.css";

function DashBoardHeader() {

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const role =
    localStorage.getItem("role");

  const employeeName =
    localStorage.getItem("employeeName");

  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentTime(new Date());

    }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, []);

  return (
    <div className="dashboard-header">

      <div className="dashboard-welcome">

        <h1>
          Good {getGreeting()},{" "}
          {employeeName || role} 👋
        </h1>

        <p>
          Here's what's happening at
          JAM Enterprises today.
        </p>

      </div>

      <div className="dashboard-date-time">

        <h2>
          {currentTime.toLocaleTimeString()}
        </h2>

        <p>
          {currentTime.toLocaleDateString(
            "en-IN",
            {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )}
        </p>

      </div>

    </div>
  );
}

function getGreeting() {

  const hour = new Date().getHours();

  if (hour < 12) {
    return "Morning";
  }

  if (hour < 17) {
    return "Afternoon";
  }

  return "Evening";
}

export default DashBoardHeader;