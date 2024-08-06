import Config from "../../../Config";
import axios from "axios";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headers from "../../../headers";
const UpdateDescription = ({ user }) => {
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const updateDescription = async () => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/writers/description/update/${user._id}`,
        { description },{
          headers
        }
      );

      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("There was a problem updating the description.");
      }
    }
  };

  return (
    <div className="card">
      <textarea
        name="description"
        cols="30"
        rows="10"
        placeholder="Update profile description..."
        className="textbox"
        value={description}
        onChange={handleDescriptionChange}
      ></textarea>
      {errorMessage && <p className="error" style={{ color: "var(--pinkRed)" }}>{errorMessage}</p>}
      
      <input
        type="submit"
        value="UPDATE DESCRIPTION"
        className="submit-btn"
        style={{ marginTop: "1rem" }}
        onClick={updateDescription}
      />
    </div>
  );
};

export default UpdateDescription;
