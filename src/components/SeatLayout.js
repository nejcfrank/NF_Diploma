// SeatLayout.js

import React from "react";
import SeatRowSpace from "./SeatRowSpace";
import SeatRow from "./SeatRow";

function SeatLayout({ seats, selectedSeats, toggleSeatSelection }) {
  return (
    <div>
      {/* First Row */}
      <SeatRowSpace
        seats={seats.slice(0, 24)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      {/* Spacer */}
      <div className="spacer_horizontally"></div>
      {/* Second Row */}
      <SeatRowSpace
        seats={seats.slice(24, 52)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRowSpace
        seats={seats.slice(52, 80)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRowSpace
        seats={seats.slice(80, 112)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />

      <SeatRowSpace
        seats={seats.slice(112, 144)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRowSpace
        seats={seats.slice(144, 176)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />

      <div className="spacer_vertically"></div>
      <SeatRow
        seats={seats.slice(176, 209)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRow
        seats={seats.slice(209, 238)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRow
        seats={seats.slice(238, 263)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRow
        seats={seats.slice(263, 288)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRow
        seats={seats.slice(288, 309)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />
      <SeatRow
        seats={seats.slice(309, 324)}
        selectedSeats={selectedSeats}
        toggleSeatSelection={toggleSeatSelection}
      />

      <div className="stage-wrapper">
        <div className="parter">PARTER</div>
      </div>

      <div className="spacer_vertically"></div>

      <div className="balcony">
        <SeatRow
          seats={seats.slice(324, 349)}
          selectedSeats={selectedSeats}
          toggleSeatSelection={toggleSeatSelection}
        />
        <SeatRow
          seats={seats.slice(349, 369)}
          selectedSeats={selectedSeats}
          toggleSeatSelection={toggleSeatSelection}
        />
        <SeatRow
          seats={seats.slice(369, 388)}
          selectedSeats={selectedSeats}
          toggleSeatSelection={toggleSeatSelection}
        />
        <SeatRow
          seats={seats.slice(388, 404)}
          selectedSeats={selectedSeats}
          toggleSeatSelection={toggleSeatSelection}
        />
      </div>
    </div>
  );
}

export default SeatLayout;
