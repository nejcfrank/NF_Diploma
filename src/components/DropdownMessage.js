// DropdownMessage.js
import React, { useEffect } from "react";
import "../styling/DropdownMessage.css";

function DropdownMessage({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className="dropdown-message">{message}</div>;
}

export default DropdownMessage;
