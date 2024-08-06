import React, { useState } from "react";
import Config from "../../Config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headers from "../../headers";

const PayWriter = ({
  handleShowPayModal,
  fetchPendingWithdrawals,
  writerToPay,
}) => {
  const writerFirstName = writerToPay?.writer?.firstName ?? "";
  const writerLastName = writerToPay?.writer?.lastName ?? "";
  const writerId = writerToPay?.writer?._id ?? "";
  const requestAmount = writerToPay?.amount ?? 0;
  const withdrawalId = writerToPay?._id ?? "";

  const [clearAmount, setClearAmount] = useState(requestAmount);

  const clearUserPayment = async () => {
    if (!clearAmount || isNaN(clearAmount) || clearAmount <= 0) {
      toast.error("Please enter a valid amount to clear.");
      return;
    }

    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/withdraw/${withdrawalId}/clear`,
        {
          writerId,
          amount: clearAmount,
        },
        {
          headers,
        }
      );

      if (response.data.success) {
        await fetchPendingWithdrawals();
        handleShowPayModal();
        toast.success("User payment cleared successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error clearing user payment:", error);
      toast.error("Failed to clear user payment. Please try again.");
    }
  };

  return (
    <div className="modal-wrapper">
      <p className="medium-header" style={{ color: "var(--blue)" }}>
        {`${writerFirstName.toUpperCase()} ${writerLastName.toUpperCase()} WITHDRAWAL`}
      </p>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="input-group">
          <p>{`REQUEST(SH): ${requestAmount}`}</p>
          <input
            type="text"
            name="clearAmount"
            id="clearAmount"
            placeholder="Enter the amount to clear..."
            value={clearAmount}
            onChange={(e) => setClearAmount(e.target.value)}
          />
        </div>
      </form>

      <div className="row-buttons">
        <button className="modal-btn" onClick={handleShowPayModal}>
          CANCEL
        </button>
        <button className="modal-btn" onClick={clearUserPayment}>
          OK
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default PayWriter;
