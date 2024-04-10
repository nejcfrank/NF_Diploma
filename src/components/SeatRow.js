import React from "react";
import Seat from "./Seat";

function SeatRow({ seats, selectedSeats, toggleSeatSelection }) {
  return (
    <div className="row">
      {seats.map((seat) => (
        <Seat
          key={seat.id}
          seatId={seat.id}
          isAvailable={seat.is_available}
          isSelected={selectedSeats.includes(seat.id)}
          onClick={() => toggleSeatSelection(seat.id)}
        />
      ))}
    </div>
  );
}

export default SeatRow;
