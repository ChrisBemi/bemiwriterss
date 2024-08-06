import React, { useState, useEffect } from "react";
import Config from "../../../Config";
import axios from "axios";
import headers from "../../../headers";
import "react-toastify/dist/ReactToastify.css";
const UpdateCharges = ({ orderToUpdate, fetchWork }) => {
  const [charges, setCharges] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCharges(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!charges || isNaN(charges) || Number(charges) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/update/assignment/${orderToUpdate._id}/update/charges`,
        {
          charges: charges,
        },
        {
          headers,
        }
      );

      if (response.data.success) {
        await fetchWork();
        alert(response.data.message);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      setError("Failed to update charges. Please try again.");
    }
  };

  useEffect(() => {
    if (charges) {
      setError("");
    }
  }, [charges]);

  return (
    <form onSubmit={handleSubmit}>
      <p>Update Charges</p>
      <div className="input-group" style={{ marginTop: "18px" }}>
        <input
          type="text"
          name="charges"
          placeholder="Enter new charges..."
          value={charges}
          onChange={handleChange}
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
        value="UPDATE CHARGES"
      />
    </form>
  );
};

export default UpdateCharges;
