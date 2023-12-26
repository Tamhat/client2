import React, { useState, useEffect } from "react";

function Timer({ time }) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Function to update the time remaining
  const updateTimeRemaining = () => {
    // Calculate the time remaining in seconds
    const currentTime = new Date();
    const targetTime = new Date(time); // Set your target date and time here
    const timeDifference = targetTime - currentTime;
    const secondsRemaining = Math.max(0, Math.floor(timeDifference / 1000));
    setTimeRemaining(secondsRemaining);
  };

  useEffect(() => {
    // Update the time remaining immediately when the component is mounted
    updateTimeRemaining();

    // Update the time remaining every second
    const intervalId = setInterval(updateTimeRemaining, 1000);

    return () => {
      // Clean up the interval when the component is unmounted
      clearInterval(intervalId);
    };
  }, []);

  const days = Math.floor(timeRemaining / (3600 * 24));
  const hours = Math.floor((timeRemaining % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  return (
    <div>
      <p className="time-value">
        {days} Day {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
}

export default Timer;
