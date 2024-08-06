import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../../Config";
import headers from "../../../headers";

const UpdateTime = ({ fetchWork, orderToUpdate }) => {
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const deadline = orderToUpdate?.dateline;
  const deadlineDate = deadline
    ? new Date(deadline).toISOString().split("T")[0]
    : null;
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    

    if (!time) {
      setError("Please select a valid time.");
      return;
    }

    if (deadlineDate === today) {
      const now = new Date();
      const selectedTime = new Date(`${today}T${time}`);

      if (isNaN(selectedTime.getTime())) {
        setError("Invalid time selected.");
        return;
      }

      if (selectedTime <= now) {
        setError("Please select a future time for today.");
        return;
      }
    }

    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/update/assignment/${orderToUpdate._id}/update/time`,
        { time },
        { headers }
      );

      if (response.data.success) {
        await fetchWork();
        alert(response.data.message || "Submission time updated successfully!");
      } else {
        alert(response.data.message || "Check your internet connection.", {
          toastId: "updateError",
        });
      }
    } catch (err) {
      alert("Failed to update time. Please try again.", {
        toastId: "updateError",
      });
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <p>Update Time</p>
        <input
          type="time"
          name="time"
          min={today}
          value={time}
          onChange={handleChange}
          style={{ marginTop: "18px" }}
        />
        {error && (
          <p className="error" style={{ color: "var(--pinkRed)" }}>
            {error}
          </p>
        )}
      </div>
      <input
        type="submit"
        style={{ marginTop: "10px" }}
        className="submit-btn"
        value="UPDATE TIME"
      />
    </form>
  );
};

export default UpdateTime;
