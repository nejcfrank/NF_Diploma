import React from "react";
import "../styling/Seat.css";

function Seat({ seatId, isAvailable, isSelected, onClick }) {
  let seatColor;
  if (isSelected) {
    seatColor = "#ffff00"; // Yellow if selected
  } else {
    seatColor = isAvailable ? "#00ff00" : "#ff0000"; // Green if available, red if not
  }

  return (
    <div
      className="seat"
      style={{ backgroundColor: seatColor }}
      onClick={() => onClick(seatId)}
    ></div>
  );
}

export default Seat;

