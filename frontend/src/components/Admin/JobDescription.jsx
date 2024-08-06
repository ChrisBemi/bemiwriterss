import CloseIcon from "../../assets/icons/close.png";
import "./descriptionModal.css";

const JobDescription = ({ workingOrder, handleDescriptionModal }) => {
  const subject = workingOrder?.subject?.toUpperCase() || "NO SUBJECT";
  const description = workingOrder?.description || "No description available.";

  return (
    <div className="modal-wrapper job">
      <div className="modal-wrapper-container">
        {/* <img
          src={CloseIcon}
          alt="Close"
          className="close-icon"
          onClick={handleDescriptionModal}
        /> */}
        <p className="modals-header">{`${subject} DESCRIPTION`}</p>
        <p className="modal-description">{description}</p>
      </div>
      <button className="table-btn" onClick={handleDescriptionModal}>
        CANCEL
      </button>
    </div>
  );
};

export default JobDescription;
