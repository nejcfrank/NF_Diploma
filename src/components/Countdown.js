import React, { useState, useEffect } from "react";
import "../styling/Countdown.css";

function Countdown({ expirationTime, onExpiration }) {
  const calculateSecondsLeft = (expirationTime) => {
    if (!expirationTime) return 0;

    const difference = new Date(expirationTime) - new Date();
    const secondsLeft = Math.floor(difference / 1000);
    return secondsLeft >= 0 ? secondsLeft : 0;
  };

  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const storedExpirationTime = sessionStorage.getItem("expirationTime");
    if (storedExpirationTime) {
      const seconds = calculateSecondsLeft(storedExpirationTime);
      setSecondsLeft(seconds);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSecondsLeft((prevSecondsLeft) =>
        prevSecondsLeft > 0 ? prevSecondsLeft - 1 : 0
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (expirationTime) {
      const storedExpirationTime = new Date(expirationTime);
      const currentTime = new Date();
      if (storedExpirationTime <= currentTime) {
        // Expiration time has passed, trigger the onExpiration callback
        onExpiration();
      }
    }
  }, [expirationTime, onExpiration]);

  if (!expirationTime || secondsLeft === 0) {
    // Render nothing when expiration time is null or when countdown reaches 0
    return null;
  }

  return (
    <div className="countdown-container">
      <p>
        Your reservation expires in <b className="bold-red">{secondsLeft}</b>{" "}
        seconds
      </p>
    </div>
  );
}

export default Countdown;
