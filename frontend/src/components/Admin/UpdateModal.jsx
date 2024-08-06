import "./updatemodal.css";
import CloseIcon from "../../assets/icons/close.png";
import UpdateOrderDescription from "./Updatework/UpdateOrderDescription";
import UpdateOrderDateline from "./Updatework/UpdateOrderDateline";
import UpdateCharges from "./Updatework/UpdateCharges";
import UpdateOrderFiles from "./Updatework/UpdateOrderFiles";
import UpdateTime from "./Updatework/UpdateTime";
import UpdatePenalty from "./Updatework/UpdatePenalty";
const UpdateModal = ({ handleUpdateModal, orderToUpdate, fetchWork }) => {
  return (
    <div className="modal-wrapper update">
      <div className="wrapper-container">
        <img
          src={CloseIcon}
          alt=""
          className="close-icon"
          onClick={handleUpdateModal}
        />
        <div className="medium-header">{`UPDATE '${orderToUpdate?.subject.toUpperCase()}' ORDER ID: ${
          orderToUpdate?.orderId
        }`}</div>
        <div className="grid">
          <div className="col">
            <UpdateOrderDescription
              fetchWork={fetchWork}
              orderToUpdate={orderToUpdate}
            />
            <UpdatePenalty
              fetchWork={fetchWork}
              orderToUpdate={orderToUpdate}
            />
          </div>
          <div className="col">
            <UpdateOrderDateline
              fetchWork={fetchWork}
              orderToUpdate={orderToUpdate}
            />
            <UpdateOrderFiles
              fetchWork={fetchWork}
              orderToUpdate={orderToUpdate}
            />
            <UpdateCharges
              fetchWork={fetchWork}
              orderToUpdate={orderToUpdate}
            />
            <UpdateTime fetchWork={fetchWork} orderToUpdate={orderToUpdate} />
          </div>
        </div>
        <div
          className="row-buttons"
          style={{
            marginTop: "1rem",
            borderTop: "2px solid var(--blue)",
            width: "100%",
          }}
        >
          <button className="modal-btn" onClick={handleUpdateModal}>
            CANCEL
          </button>
          <button className="modal-btn">OK</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
