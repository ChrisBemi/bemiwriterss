import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./Admin.css";
import "./AddWrite.css";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import "./writers.css";
import DeleteWriter from "../../components/Admin/DeleteWriter";
import EmailingIcon from "../../assets/images/email.svg";
import Preloader from "../../Preloader/Preloader";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headers from "../../headers";

const Writers = () => {
  const loading = useSelector((state) => state.alerts.loading);
  const dispatch = useDispatch();
  const [writers, setWriters] = useState([]);
  const [sidebar, showSidebar] = useState(false);
  const [writerToWorkWith, setWriterToWorkWith] = useState([]);
  const [deleteModal, showDeleteModal] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!subject.trim()) {
      errors.subject = "Subject is required";
    }
    if (!message.trim()) {
      errors.message = "Message is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});

      // Collect email addresses of all writers
      const emails = writers.map((writer) => writer.email);

      try {
        dispatch(showLoading());
        const response = await axios.post(
          `${Config.baseUrl}/api/notifications/sent/notifications`,
          { emails, subject, message },
          {
            headers,
          }
        );

        if (response.data.success) {
          dispatch(hideLoading());
          toast.success(response.data.message);
          setMessage("");
          setSubject("");
        } else {
          toast.error(response.data.message);
          dispatch(hideLoading());
        }
      } catch (error) {
        dispatch(hideLoading());
        toast.error(
          error.response?.data?.message || "Failed to send notification"
        );
      }
    }
  };

  const fetchWriters = async () => {
    try {
      const response = await axios.get(`${Config.baseUrl}/api/writers/get`, {
        headers,
      });
      if (response.data.success) {
        setWriters(response.data.data);
      } else {
        console.log("There was a network problem fetching data");
      }
    } catch (error) {
      console.log("There was a problem accessing the server");
    }
  };

  const handleWriterToWorkWith = (writer) => {
    setWriterToWorkWith(writer);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const handleDeleteModal = () => {
    showDeleteModal(!deleteModal);
  };

  useEffect(() => {
    fetchWriters();
  }, []);

  return (
    <div className="admin writers">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="WRITERS"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <ToastContainer />
        <div className="notification">
          <p className="medium-header">SENT NOTIFICATION TO WRITERS</p>
          <form className="notification-form" onSubmit={handleSubmit}>
            <div className="col">
              <img
                src={EmailingIcon}
                alt=""
                style={{ width: "350px", height: "200px" }}
              />
              <div className="input-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter message subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {errors.subject && <p className="error">{errors.subject}</p>}
              </div>
            </div>
            <div className="col">
              <div className="input_group">
                <textarea
                  name="message"
                  placeholder="Type Notification............"
                  cols={10}
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                {errors.message && <p className="error">{errors.message}</p>}
              </div>
              <input type="submit" className="submit-btn" value="SUBMIT" />
            </div>
          </form>
        </div>
        {writers.length > 0 ? (
          <div className="table_wrapper">
            <table>
              <thead>
                <tr>
                  <td>ID NO</td>
                  <td>NAME</td>
                  <td>EMAIL</td>
                  <td>PHONE NO</td>
                  <td>EDUCATION LEVEL</td>
                  <td>QUALIFICATIONS</td>
                  <td>DELETE</td>
                </tr>
              </thead>
              <tbody>
                {writers.map((writer) => (
                  <tr key={writer._id}>
                    <td>
                      <p className="description">{writer.systemId}</p>
                    </td>
                    <td>
                      <p className="description">{`${writer.firstName} ${writer.lastName}`}</p>
                    </td>
                    <td>
                      <p className="description">{writer.email}</p>
                    </td>
                    <td>
                      <p className="description">{writer.phoneNo}</p>
                    </td>
                    <td>
                      <p className="description">{writer.educationLevel}</p>
                    </td>
                    <td>
                      <p className="description">{writer.qualifications}</p>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        style={{ fontSize: "12px", fontWeight: "600" }}
                        onClick={() => {
                          handleWriterToWorkWith(writer);
                          handleDeleteModal();
                        }}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No writers found</p>
        )}
        {loading && <Preloader />}
      </div>
      <div className={`modal delete-writer ${deleteModal ? "active" : null}`}>
        <DeleteWriter
          handleDeleteModal={handleDeleteModal}
          writerToWorkWith={writerToWorkWith}
          fetchWriters={fetchWriters}
        />
      </div>
    </div>
  );
};

export default Writers;
