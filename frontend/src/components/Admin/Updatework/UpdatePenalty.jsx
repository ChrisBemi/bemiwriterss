import React, { useState } from "react";
import headers from "../../../headers";
import axios from "axios";
import Config from "../../../Config";

const UpdatePenalty = ({ fetchWork, orderToUpdate }) => {
  const [penalty, setPenalty] = useState("");
  const [errors, setErrors] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) {
      // Validate input
      setPenalty(value);
      setErrors(""); // Clear errors when input is valid
    } else {
      setErrors("Please enter a valid number.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const penaltyValue = parseFloat(penalty);
    console.log(penaltyValue);

    if (!penalty || isNaN(penaltyValue)) {
      setErrors("Penalty must be a valid number.");
      return;
    }

    if (penaltyValue >= orderToUpdate.charges) {
      setErrors("Penalties must be less than Job's charges.");
      return;
    }

    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${orderToUpdate._id}/update/penalty`,
        { penalties: penaltyValue }, // Ensure this matches your API's expected payload
        {
          headers,
        }
      );

      console.log(response.data);

      if (response.data.success) {
        setPenalty("");
        setErrors("");
        alert(response.data.message);
        await fetchWork();
      } else {
        setErrors(response.data.message || "Failed to update the penalty.");
      }
    } catch (error) {
      console.error("An error occurred while updating the penalty:", error);
      setErrors("Failed to update the penalty. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="input-group" style={{ marginTop: "18px" }}>
        <p>Update Job's Penalty</p>
        <input
          type="text"
          name="penalty"
          placeholder="Enter penalty"
          value={penalty}
          onChange={handleChange}
        />
        {errors && <p className="error">{errors}</p>}
      </div>
      <input
        type="submit"
        style={{ marginTop: "10px" }}
        className="submit-btn"
        value="UPDATE PENALTY"
      />
    </form>
  );
};

export default UpdatePenalty;
