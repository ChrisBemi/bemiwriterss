import Config from "../../../Config";
import axios from "axios";
import { useState } from "react";

import { ToastContainer, toast } from "react-toastify";

import headers from "../../../headers";

import "react-toastify/dist/ReactToastify.css";

const UpdatePhone = ({ user }) => {
  const [phoneNo, setPhoneNo] = useState("");
  const [message, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Validate phone number format (10 digits)
    if (/^\d{0,10}$/.test(value)) {
      setPhoneNo(value);
    }
  };

  const updatePhoneNumber = async () => {
    try {
      if (phoneNo.length !== 10) {
        setErrorMessage("Phone number must be 10 digits.");
        return;
      }

      const response = await axios.put(
        `${Config.baseUrl}/api/writers/phone-no/update/${user._id}`,
        { phoneNumber: phoneNo },
        {
          headers,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setErrorMessage("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("There was a problem updating the phone number.");
      }
    }
  };

  return (
    <div className="card">
      <ToastContainer />
      <p className="large-headers">PHONE NO UPDATE</p>
      <div className="input-group">
        <input
          type="text"
          name="phone"
          placeholder="Phone No..."
          value={phoneNo}
          onChange={handlePhoneChange}
        />
        {errorMessage && (
          <p className="error" style={{ color: "var(--pinkRed)" }}>
            {errorMessage}
          </p>
        )}
      </div>
      <input
        type="submit"
        value="UPDATE"
        className="submit-btn"
        style={{ marginTop: "1rem" }}
        onClick={updatePhoneNumber}
      />
    </div>
  );
};

export default UpdatePhone;
