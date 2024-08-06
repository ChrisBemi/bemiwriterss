import React from "react";

const DeleteWithdrawals = ({ handleDeleteModal }) => {
  return (
    <div className="modal-wrapper">
      Are sure you want to delete the selected items?
      <div className="row-buttons">
        <button className="modal-btn" onClick={handleDeleteModal}>
          CANCEL
        </button>
        <button className="modal-btn">OK</button>
      </div>
    </div>
  );
};

export default DeleteWithdrawals;
