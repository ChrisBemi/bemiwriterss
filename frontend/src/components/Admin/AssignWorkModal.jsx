import axios from "axios";
import { useSelector } from "react-redux";
import Config from "../../Config";
import { useState } from "react";
const AssignWorkModal = ({
  handleDisplayWorkModal,
  writerToAssign,
  fetchWriters,
}) => {
  const [successMessage, setSuccessMessage] = useState("");
  const assignWorkToWriter = async () => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/assign/${writerToAssign.assignmentId}`,
        {
          writerId: writerToAssign._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      fetchWriters();
      handleDisplayWorkModal();
    } catch (error) {
      console.log(`There was a problem accessing the server ${error.message}`);
    }
  };

  return (
    <div className="modal-wrapper">
      <p className="medium-header">ASSIGN WORK</p>
      <p className="card-headers">{`${writerToAssign?.firstName} ${writerToAssign?.lastName}`}</p>
      <p className="card-headers">{`${writerToAssign?.email}`}</p>
      <p className="card-headers">{`${writerToAssign?.phoneNo}`}</p>
      <p className="card-headers">{`${writerToAssign?.qualifications}`}</p>
      <p className="card-headers">{writerToAssign?.educationalLevel}</p>

      {writerToAssign?.description ? (
        <p> {writerToAssign?.description}</p>
      ) : (
        <p className="description">
          With a background in [Your Education Level and Field, e.g., 'Bachelor
          of Education (Physics and Maths)'], I bring a unique blend of
          technical knowledge and creative writing skills to every project. Over
          the years, I've honed my ability to communicate complex ideas clearly
          and compellingly, making me a versatile writer capable of handling a
          wide range of topics
        </p>
      )}
      <div className="row-buttons">
        <button className="modal-btn" onClick={handleDisplayWorkModal}>
          CANCEL
        </button>
        <button className="modal-btn" onClick={assignWorkToWriter}>
          ASSIGN
        </button>
      </div>
    </div>
  );
};
export default AssignWorkModal;
