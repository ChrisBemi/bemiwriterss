import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Config from "../../../Config";

import headers from "../../../headers";

const WithDrawalForm = ({ fetchPendingWithdrawals }) => {
  // State hooks for form inputs, errors, and submission status
  const [phoneNo, setPhoneNo] = useState("");
  const [confirmPhoneNo, setConfirmPhoneNo] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const validationErrors = {};
    if (!phoneNo.trim().match(/^0\d{9}$/)) {
      validationErrors.phoneNo = "Enter a valid Safaricom number (0xxxxxxxxx)";
    }
    if (phoneNo.length > 10) {
      validationErrors.phoneNo = "Enter a 10 digit number";
    }
    if (phoneNo !== confirmPhoneNo) {
      validationErrors.confirmPhoneNo = "Phone numbers do not match";
    }
    if (!amount || isNaN(amount)) {
      validationErrors.amount = "You must place the amount to withdrawal";
    }
    // If there are validation errors, set state and return
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/withdraw/${sessionStorage.getItem(
          "userId"
        )}/request/withdrawal`,
        {
          amount: amount,
          phoneNo: phoneNo,
        },
        {
          headers,
        }
      );

      if (response.data.success) {
        fetchPendingWithdrawals();
        toast.success(
          response.data.message ||
            "Withdrawal request sent successfully! We will deposit your money in your M-PESA!"
        );
      } else {
        toast.error(
          response.data.message || "An error occurred. Please try again."
        );
      }

      setSubmitted(true);
      // Reset form after submission (optional)
      setPhoneNo("");
      setConfirmPhoneNo("");
      setAmount("");
      setErrors({});
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  // Function to handle input changes and update state
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear corresponding error when user starts typing again
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));

    // Update form input state
    if (name === "phoneNo") {
      setPhoneNo(value);
    } else if (name === "confirmPhoneNo") {
      setConfirmPhoneNo(value);
    } else if (name === "amount") {
      setAmount(value);
    }
  };

  return (
    <div className="withdrawal-form">
      <p className="large-headers">PENDING WITHDRAWALS</p>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            name="phoneNo"
            value={phoneNo}
            onChange={handleInputChange}
            placeholder="Enter Safaricom number (0xxxxxxxxx)"
          />
          {errors.phoneNo && <p className="error">{errors.phoneNo}</p>}
        </div>
        <div className="input-group">
          <input
            type="text"
            name="confirmPhoneNo"
            value={confirmPhoneNo}
            onChange={handleInputChange}
            placeholder="Confirm Safaricom number (0xxxxxxxxx)"
          />
          {errors.confirmPhoneNo && (
            <p className="error">{errors.confirmPhoneNo}</p>
          )}
        </div>
        <div className="input-group">
          <input
            type="text"
            name="amount"
            value={amount}
            onChange={handleInputChange}
            placeholder="Enter amount in figures without any symbol.."
          />
          {errors.amount && <p className="error">{errors.amount}</p>}
        </div>
        <div className="input_group">
          <input
            type="submit"
            className="submit-btn"
            value="SUBMIT"
            style={{
              background: "var(--dark-gold)",
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default WithDrawalForm;
