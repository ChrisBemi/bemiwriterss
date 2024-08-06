import axios from "axios";
import Config from "../../../Config";
import { useState } from "react";

import headers from "../../../headers";

const UpdateOrderDescription = ({ orderToUpdate,fetchWork  }) => {
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setDescription(e.target.value);
    if (e.target.value.trim() === "") {
      setErrors("Description is required");
    } else {
      setErrors("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim() === "") {
      setErrors("Description is required");
      return;
    }

    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${orderToUpdate._id}/update/description`,
        { description },
        {  headers }
      );

      if (response.data.success) {
        await fetchWork()
        setMessage(response.data.message || "Description updated successfully");
      } else {
        setErrors(response.data.message || "Failed to update description");
      }
    } catch (error) {
      setErrors("Failed to update description");
    }

    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="input_group">
        <p style={{ margin: "1rem 0rem -0.5rem 0rem" }}>
          Update Order Description
        </p>
        <textarea
          name="description"
          id="description"
          cols="30"
          rows="20"
          placeholder="Enter order description..."
          value={description}
          onChange={handleChange}
        ></textarea>
        {errors && <p className="error">{errors}</p>}
        {message && <p className="success">{message}</p>}
      </div>
      <input
        type="submit"
        className="submit-btn"
        value="UPDATE"
        style={{ marginTop: "1.4rem" }}
      />
    </form>
  );
};

export default UpdateOrderDescription;
