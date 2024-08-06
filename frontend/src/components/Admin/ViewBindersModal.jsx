import "./ViewBinders.css";
import CloseIcon from "../../assets/icons/close.png";
import BinderCard from "./BinderCard";

const ViewBindersModal = ({
  handleAssigningModal,
  academicWriters,
  fetchWriters,
 
}) => {
  const writersList = Array.isArray(academicWriters)
    ? academicWriters.filter(
        (writer) => writer._id && writer.firstName && writer.lastName
      )
    : [];
  const assignmentList = Array.isArray(academicWriters)
    ? academicWriters.filter((item) => item.assignmentId)
    : [];
  const orderId = assignmentList[0]?.assignmentId;

  return (
    <div className="modal-wrapper bind">
      <img
        src={CloseIcon}
        alt=""
        className="close-icon"
        onClick={handleAssigningModal}
      />
      <div className="inner-container">
        <p className="modals-header">BIDERS</p>
        <div className="grid">
          {writersList?.map((writer, index) => (
            <BinderCard
              writer={writer}
              key={index}
              orderId={orderId}
              fetchWriters={fetchWriters}
              handleAssigningModal={handleAssigningModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewBindersModal;
