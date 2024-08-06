import CloseIcon from "../../../assets/icons/close.png";
import Config from "../../../Config";
import axios from "axios";
import { useState } from "react";
import headers from "../../../headers";
const BindingModal = ({
  handleShowBindModal,
  bindModal,
  job,
  fetchWriters,
}) => {
  const expressInterest = async () => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/assignments/add/bid/${job._id}`,
        { writerId: sessionStorage.getItem("userId") },
        { headers }
      );

      fetchWriters();

      handleShowBindModal();
    } catch (error) {
      console.error(`Error expressing interest: ${error.message}`);
    }
  };

  return (
    <div className={`modal ${bindModal ? "active" : ""}`}>
      <div className="modal-wrapper">
        <div className="close-icon" onClick={handleShowBindModal}>
          <img src={CloseIcon} alt="Close" />
        </div>
        <div className="modal-content">
          <p className="medium-header">{`Are you interested in '${job?.subject.toLowerCase()}'?`}</p>
        </div>
        <div className="row-buttons">
          <button className="modal-btn" onClick={handleShowBindModal}>
            CANCEL
          </button>
          <button className="modal-btn" onClick={expressInterest}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default BindingModal;
