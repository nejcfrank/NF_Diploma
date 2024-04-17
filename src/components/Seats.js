import React, { useState, useEffect } from "react";
import "../styling/Seats.css";
import supabase from "../supabase";
import DropdownMessage from "./DropdownMessage";
import SeatLayout from "./SeatLayout";
import Countdown from "./Countdown";

function Seats() {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [showBlurOverlay, setShowBlurOverlay] = useState(false);
  const [seatSelectionAllowed, setSeatSelectionAllowed] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [expirationTime, setExpirationTime] = useState(null);

  useEffect(() => {
    const storedSelectedSeats =
      JSON.parse(localStorage.getItem("selectedSeats")) || [];
    setSelectedSeats(storedSelectedSeats);
  }, []);

  //fetches seat data when the component mounts and sets up a subscription to listen for real-time changes in the seats table
  useEffect(() => {
    fetchSeats(); // Fetch seats when component mounts

    // Subscribe to real-time changes in the "seats" table
    const seatsChannel = supabase
      .channel("realtime:seats")
      .on("INSERT", handleSeatChange)
      .on("UPDATE", handleSeatChange)
      .on("DELETE", handleSeatChange)
      .subscribe();

    // Clean up subscription on component unmount
    return () => {
      seatsChannel.unsubscribe();
    };
  });

  // recalculates the total price when the selected seats or seat data change.
  useEffect(() => {
    let totalPrice = 0;
    selectedSeats.forEach((seatId) => {
      const selectedSeat = seats.find((seat) => seat.id === seatId);
      if (selectedSeat) {
        totalPrice += selectedSeat.price || 0;
      }
    });
    setTotalPrice(totalPrice);
  }, [selectedSeats, seats]);

  //This function is triggered when there's a real-time change in the seat data.
  //It updates the seats in the state based on the change and handles scenarios where a selected seat becomes unavailable.
  const handleSeatChange = (payload) => {
    fetchSeats(); // Fetch updated seats

    if (payload.eventType === "UPDATE" && !payload.new.is_available) {
      // If the seat is no longer available, update it in the state
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.id === payload.new.id ? { ...seat, is_available: false } : seat
        )
      );

      // If the seat is selected, deselect it
      if (selectedSeats.includes(payload.new.id)) {
        setSelectedSeats((prevSelectedSeats) =>
          prevSelectedSeats.filter((seatId) => seatId !== payload.new.id)
        );
        // Display a message indicating that the seat is no longer available
        setMessage(`Seat ${payload.new.id} is no longer available.`);
        setShowMessage(true);
      }
    }
  };

  //This function fetches seat data from the database using Supabase.
  async function fetchSeats() {
    try {
      const { data, error } = await supabase
        .from("seats")
        .select("*")
        .order("seat_index");
      if (error) {
        throw error;
      }
      console.log();
      // Check reservation expiration for each seat
      const currentTime = new Date();
      const updatedSeats = data.map((seat) => {
        if (seat.reservation_expires_at) {
          const expirationTime = new Date(seat.reservation_expires_at);
          if (currentTime < expirationTime) {
            // Reservation is still valid, mark the seat as selected
            return { ...seat, is_available: false };
          } else {
            // Reservation has expired, mark the seat as available again
            return {
              ...seat,
              is_available: true,
              reservation_expires_at: null,
            };
          }
        } else {
          // No reservation for this seat
          return seat;
        }
      });

      setSeats(updatedSeats);
    } catch (error) {
      console.error("Error fetching seat data:", error.message);
    }
  }

  // This function toggles the selection of a seat.
  async function toggleSeatSelection(seatId) {
    if (!seatSelectionAllowed) {
      return;
    }

    const selectedSeatIndex = selectedSeats.indexOf(seatId);
    const selectedSeat = seats.find((seat) => seat.id === seatId);

    if (selectedSeatIndex !== -1) {
      // If seat is already selected, deselect it
      const updatedSelectedSeats = selectedSeats.filter((id) => id !== seatId);
      setSelectedSeats(updatedSelectedSeats);
      // Update seat availability instantly in the database
      await updateSeatAvailability(seatId, true); // Make the seat available again
      setMessage("");
      setShowMessage(false);
      // Remove seatId from local storage
      const storedSelectedSeats = JSON.parse(
        localStorage.getItem("selectedSeats")
      );
      if (storedSelectedSeats) {
        const updatedStoredSelectedSeats = storedSelectedSeats.filter(
          (id) => id !== seatId
        );
        localStorage.setItem(
          "selectedSeats",
          JSON.stringify(updatedStoredSelectedSeats)
        );
      }
    } else {
      if (selectedSeat.is_available) {
        // Update seat availability instantly in the database
        await updateSeatAvailability(seatId, false);
        setSelectedSeats([...selectedSeats, seatId]);
        setMessage("");
        setShowMessage(false);
        // Save selected seatId to local storage
        const storedSelectedSeats =
          JSON.parse(localStorage.getItem("selectedSeats")) || [];
        localStorage.setItem(
          "selectedSeats",
          JSON.stringify([...storedSelectedSeats, seatId])
        );
      } else {
        // Display a message indicating that the seat is unavailable
        setMessage("Seat unavailable");
        setShowMessage(true);
        setShowBlurOverlay(true);
        // Hide the message after 1 second
        setTimeout(() => {
          setMessage("");
          setShowMessage(false);
          setShowBlurOverlay(false);
        }, 1000);
      }
    }
  }

  // This function updates the availability of a seat in the database.
  async function updateSeatAvailability(seatId, isAvailable) {
    try {
      const updatedSeats = seats.map((seat) =>
        seat.id === seatId ? { ...seat, is_available: isAvailable } : seat
      );

      await supabase
        .from("seats")
        .upsert(updatedSeats, { returning: "minimal" });

      setSeats(updatedSeats);
    } catch (error) {
      console.error("Error updating seat availability:", error.message);
    }
  }

  // This function handles the purchase of selected seats by marking them as unavailable in the database.
  // This function handles the purchase of selected seats by marking them as unavailable in the database.
  async function handleBuy() {
    try {
      const updatedSeats = seats.map((seat) =>
        selectedSeats.includes(seat.id)
          ? { ...seat, is_available: false }
          : seat
      );

      await supabase
        .from("seats")
        .upsert(updatedSeats, { returning: "minimal" });

      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          selectedSeats.includes(seat.id)
            ? { ...seat, is_available: false }
            : seat
        )
      );
      setSelectedSeats([]);

      setShowCountdown(false); // Reset countdown display

      // Remove selected seats from local storage
      localStorage.removeItem("selectedSeats");

      console.log("Seats successfully bought!");
    } catch (error) {
      console.error("Error buying seats:", error.message);
    }
  }

  //This function handles seat reservation, marking selected seats as unavailable for a specific duration.
  async function handleReservation() {
    try {
      // Calculate the expiration time for the new reservation or extend the existing expiration time
      const currentTime = new Date();
      let newExpirationTime;
      if (expirationTime && expirationTime > currentTime) {
        // If there's an existing expiration time, extend it
        const remainingTime = (expirationTime - currentTime) / 1000;
        newExpirationTime = new Date(
          currentTime.getTime() + remainingTime * 1000 + 10 * 1000
        ); // Add 10 seconds to the remaining time
      } else {
        // If no existing expiration time, set a new one
        newExpirationTime = new Date(currentTime.getTime() + 10 * 1000); // Set expiration time to 10 seconds from now
      }

      sessionStorage.setItem("expirationTime", newExpirationTime.toISOString());

      // Fetch the seat data including seat_index
      const { data: seatsData, error: fetchError } = await supabase
        .from("seats")
        .select("*");

      // Throw an error if there's an issue fetching the data
      if (fetchError) {
        throw fetchError;
      }

      // Prepare the updated seat data based on the selected seats
      const updatedSeats = selectedSeats.map((seatId) => {
        const seat = seatsData.find((seat) => seat.id === seatId);
        return {
          id: seatId,
          is_available: false,
          reservation_expires_at: newExpirationTime.toISOString(),
          seat_index: seat.seat_index, // Include the seat_index
        };
      });

      // Update the selected seats in the Supabase table
      const { error } = await supabase
        .from("seats")
        .upsert(updatedSeats, { returning: "minimal" });

      // Throw an error if there's an issue updating the seats
      if (error) {
        throw error;
      }

      // Update the seats in the local state to reflect the reservation
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          selectedSeats.includes(seat.id)
            ? {
                ...seat,
                is_available: false,
                reservation_expires_at: newExpirationTime.toISOString(),
              }
            : seat
        )
      );

      // Set expiration time state for the countdown
      setExpirationTime(newExpirationTime);

      // Show the countdown
      setShowCountdown(true);

      // Set a timer to revert the reservation if the ticket is not bought
      setTimeout(
        () => handleReservationTimeout(updatedSeats.map((seat) => seat.id)),
        newExpirationTime - currentTime + 1000
      );
    } catch (error) {
      console.error("Error updating seat availability:", error.message);
    }
  }

  // This function is triggered periodically to check the reservation expiration
  async function checkReservationExpiration() {
    try {
      const currentTime = new Date();
      const expiredSeats = seats.filter(
        (seat) =>
          seat.reservation_expires_at &&
          new Date(seat.reservation_expires_at) < currentTime
      );

      if (expiredSeats.length > 0) {
        // Release the expired reservations
        await handleReservationTimeout(expiredSeats.map((seat) => seat.id));
      }
    } catch (error) {
      console.error("Error checking reservation expiration:", error.message);
    }
  }

  // This function is triggered when the reservation timeout occurs. It releases reserved seats and resets the UI.
  async function handleReservationTimeout(expiredSeatIds) {
    try {
      const updatedSeats = seats.map((seat) => {
        if (expiredSeatIds.includes(seat.id)) {
          return { ...seat, is_available: true, reservation_expires_at: null }; // Set reserved seats back to available and clear reservation expiration
        }
        return seat;
      });

      await supabase
        .from("seats")
        .upsert(updatedSeats, { returning: "minimal" });

      setSeats(updatedSeats);
      setSeatSelectionAllowed(true); // Enable seat selection again
      setSelectedSeats([]); // Reset selected seats
      setShowCountdown(false); // Reset countdown display
    } catch (error) {
      console.error("Error updating seat availability:", error.message);
    }
  }

  useEffect(() => {
    // Start a timer to check reservation expiration every second
    const interval = setInterval(checkReservationExpiration, 1000);

    // Cleanup function to clear the interval
    return () => clearInterval(interval);
  });

  useEffect(() => {
    // Check if there are any reserved seats
    const hasReservedSeats = seats.some(
      (seat) =>
        seat.reservation_expires_at &&
        new Date(seat.reservation_expires_at) > new Date()
    );

    // Check if there is an expiration time stored in sessionStorage
    const storedExpirationTime = sessionStorage.getItem("expirationTime");

    if (hasReservedSeats && storedExpirationTime) {
      // If there are reserved seats and an expiration time stored, parse it and set it as the expiration time
      const expirationTime = new Date(storedExpirationTime);
      setExpirationTime(expirationTime);
      setShowCountdown(true); // Show the countdown
    }
  }, [seats]); // Dependency on seats to trigger the effect when seat data changes

  const handleExpiration = () => {
    setExpirationTime(null);
    setShowCountdown(false);
  };

  return (
    <div className="seats-container">
      {/* Existing UI components */}
      {showMessage && (
        <DropdownMessage
          message={message}
          onClose={() => setShowMessage(false)}
        />
      )}
      {showBlurOverlay && <div className="blur-overlay"></div>}
      {message && <p>{message}</p>}

      {/* New UI component to display countdown message */}

      {showCountdown && (
        <div className="countdown-container">
          {expirationTime && (
            <Countdown
              expirationTime={expirationTime}
              onExpiration={handleExpiration}
            />
          )}
        </div>
      )}

      {/* Main card container */}
      <div className="card">
        <div className="card-body">
          <div className="stage-container">
            <div className="stage-wrapper">
              <div className="stage">ODER</div>
            </div>
          </div>

          <div className="spacer_vertically"></div>

          {/* Your existing SeatLayout component */}
          <SeatLayout
            seats={seats}
            selectedSeats={selectedSeats}
            toggleSeatSelection={toggleSeatSelection}
          />

          <div className="stage-wrapper">
            <div className="parter">BALKON</div>
          </div>

          <button className="selection-button" onClick={handleBuy}>
            NAKUP ({totalPrice.toFixed(2)}€)
          </button>
          {/* "REZERVIRAJ" button */}
          {selectedSeats.length > 0 && (
            <>
              <button
                className="selection-button"
                onClick={() => {
                  handleReservation();
                }}
              >
                REZERVIRAJ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Seats;
