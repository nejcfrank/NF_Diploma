// SeatRow.js
import React from "react";
import Seat from "./Seat";

function SeatRowSpace({ seats, selectedSeats, toggleSeatSelection }) {
  const splitIndex = Math.floor(seats.length / 2);

  return (
    <div className="row">
      {/* Seats */}
      {seats.map((seat, index) => (
        <React.Fragment key={seat.id}>
          <Seat
            seatId={seat.id}
            isAvailable={seat.is_available}
            isSelected={selectedSeats.includes(seat.id)}
            onClick={() => toggleSeatSelection(seat.id)}
          />
          {index === splitIndex && <div className="spacer_horizontally"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default SeatRowSpace;
