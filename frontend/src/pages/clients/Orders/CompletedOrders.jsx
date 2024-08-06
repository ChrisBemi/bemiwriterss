import React, { useEffect, useState } from "react";
import axios from "axios";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import ".././Clients.css";
import "../InProgress/InProgress.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubmitOrders from "../SubmitOrders/SubmitOrders";
import JobDescription from "../../../components/Admin/JobDescription";
import useUser from "../../../userUser";
import JSZip from "jszip";
import headers from "../../../headers";
import formatDate from "../../../utils/FormatDate";
const CompletedOrders = () => {
  const user = useUser();
  const [orders, setOrders] = useState([]);
  const [sidebar, showSidebar] = useState(false);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [workingOrder, setWorkingOrder] = useState(null);
  const [submitModal, displaySubmitModal] = useState(false);
  const [isTimeExpired, setTimeExpired] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [descriptionModal, showDescriptionModal] = useState(false);
  const [penaltyCount, setPenalty] = useState("");
  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchUserWork = async () => {
    if (!sessionStorage.getItem("userId")) return;
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/writers/assignments/${sessionStorage.getItem(
          "userId"
        )}/completed`,
        {
          headers,
        }
      );
      setOrders(response.data.data);
    } catch (error) {
      console.log(
        `There was an error accessing the data from the backend ${error.message}`
      );
    }
  };

  const handleDownloadAllFiles = async (files, subject, name) => {
    const zip = new JSZip();

    try {
      const promises = files.map(async (file) => {
        const url = `${file.downloadURL}`;
        try {
          const response = await axios.get(url, {
            responseType: "arraybuffer",
          });
          if (response.data) {
            zip.file(file.fileName, response.data);
          } else {
            console.error(`Empty response for file ${file.fileName}`);
          }
        } catch (error) {
          console.error(`Error fetching file ${file.fileName}:`, error);
          // Handle error or notify the user
        }
      });

      await Promise.all(promises);

      zip.generateAsync({ type: "blob" }).then((content) => {
        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.setAttribute(
          "download",
          `${subject}_${name}_assignment_files.zip`
        );

        // Append the anchor element to the body and trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up: remove the temporary anchor element
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
      // Handle zip generation error or notify the user
    }
  };

  const calculateRemainingTime = (dueDate, time, orderId, charges, penalty) => {
    const now = new Date().getTime();

    const dueDateTimeString = `${dueDate.split("T")[0]}T${time}`;
    const dueDateTime = new Date(dueDateTimeString).getTime();

    if (isNaN(dueDateTime)) {
      return { timeString: "Invalid date/time", overdue: false, penalty: 0 };
    }

    const distance = dueDateTime - now;
    const overdue = distance < 0;
    const absDistance = Math.abs(distance);

    const days = Math.floor(absDistance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (absDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((absDistance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDistance % (1000 * 60)) / 1000);

    const timeString = (
      <p
        className="description"
        style={{ color: overdue ? "var(--pinkRed)" : "var(--success-color)" }}
      >
        {overdue ? `Expired ` : ""}
        {days}d {hours}h {minutes}m {seconds}s {overdue ? "ago" : ""}
      </p>
    );

    const delayMinutes = overdue ? Math.floor(absDistance / (1000 * 60)) : 0;
    const penaltyAmount = delayMinutes * 5;

    if (penaltyAmount >= charges) {
      return {
        timeString: (
          <p className="description" style={{ color: "var(--pinkRed)" }}>
            {`Time expired  and penalty equaled charges`}
          </p>
        ),
        overdue,
        penalty: charges,
      };
    }

    return {
      timeString,
      overdue,
      minutes: delayMinutes,
      penalty: penaltyAmount,
    };
  };

  const updatePenalty = async (
    assignmentId,
    delayMinutes,
    charges,
    penalty
  ) => {
    try {
      const penaltyAmount = delayMinutes * 5;

      if (penalty > charges) {
        return;
      }

      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${assignmentId}/update/penalty`,
        { penalty: penaltyAmount },
        {
          headers,
        }
      );

      if (response.data.success) {
        fetchUserWork();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("An error occurred while updating penalty");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("userId")) {
      fetchUserWork();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prevCountdowns) => {
        const updatedCountdowns = orders.reduce((acc, order) => {
          const { timeString, overdue, minutes } = calculateRemainingTime(
            order.dateline,
            order.time,
            order._id,
            order.charges,
            order.penalty
          );

          acc[order._id] = {
            timeString,
            overdue,
            minutes,
            penalty: order.penalty,
          };

          return acc;
        }, {});
        return updatedCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);
  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach((order) => {
        const { overdue, minutes } = calculateRemainingTime(
          order.dateline,
          order.time,
          order._id
        );

        if (overdue && !order.penaltyUpdated) {
          updatePenalty(order._id, minutes, order.charges, order.penalty);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleWorkingWork = (order) => {
    setWorkingOrder(order);
  };

  const handleSubmitModal = () => {
    displaySubmitModal(!submitModal);
  };

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const orderIdMatch = order._id
        .toLowerCase()
        .includes(filterText.toLowerCase());
      const subjectMatch = order.subject
        .toLowerCase()
        .includes(filterText.toLowerCase());
      return orderIdMatch || subjectMatch;
    });
    setFilteredOrders(filtered);
  }, [filterText, orders]);

  const handleDescriptionModal = () => {
    showDescriptionModal(!descriptionModal);
  };

  return (
    <div className="progress account">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="IN PROGRESS"
      />
      <p className="empty"></p>
      <AccountSidebar sidebar={sidebar} />
      <div className="container">
        <div className="search_container">
          <div className="input-group">
            <input
              type="text"
              name="search"
              id=""
              placeholder="Filter by orderId or subject"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <button>
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <ToastContainer />
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Order Id</td>
                <td>Paper Details</td>
                <td>Pages</td>
                <td>Words</td>
                <td>Charges(SH)</td>
                <td>Time Assigned</td>
                <td className="due-time">CompletedAt</td>

                <td>
                  <p>Download</p>
                  <p>Instructions</p>
                </td>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) =>
                  order.completed ? (
                    <tr key={order._id}>
                      <td>
                        {order.orderId ? (
                          <p className="description">
                            Order Id: {order.orderId}
                          </p>
                        ) : (
                          <p className="description">Order Id: {order._id}</p>
                        )}
                      </td>
                      <td>
                        <p className="description">{`Title: ${order.subject}`}</p>
                        <p
                          className="description"
                          style={{ color: "var(--blue)", fontWeight: "600" }}
                        >{`Category: ${order.category}`}</p>
                      </td>
                      <td>
                        <p className="description">{order?.page}</p>
                      </td>
                      <td>
                        <p className="description">{order?.words}</p>
                      </td>
                      <td>
                        <p className="description">{order?.charges}</p>
                      </td>
                      <td>
                        <p className="description">
                          {formatDate(order.assignedAt)}
                        </p>
                      </td>
                      <td className="due-time">
                        <div className="time-container">
                          <p
                            className="description"
                            style={{ color: "var(--blue)" }}
                          >
                            {formatDate(order?.completedAt)}
                          </p>
                        </div>
                      </td>

                      <td>
                        <div className="description-buttons">
                          {order?.description && (
                            <button
                              className="table-btn"
                              onClick={() => {
                                handleWorkingWork(order);
                                handleDescriptionModal();
                              }}
                              style={{
                                background: "var(--blue)",
                                border: "2px solid var(--blue)",
                              }}
                            >
                              Description
                            </button>
                          )}

                          {order.files.length !== 0 ? (
                            <button
                              className="table-btn"
                              onClick={() => {
                                handleDownloadAllFiles(
                                  order.files,
                                  order.subject,
                                  "assignments"
                                );
                              }}
                            >
                              Get files
                            </button>
                          ) : (
                            <></>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null
                )
              ) : (
                <tr>
                  <td colSpan="6">
                    <p>There is no order in progress!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`submit-orders account modal ${
            submitModal ? "active" : null
          } `}
        >
          <SubmitOrders
            workingOrder={workingOrder}
            handleSubmitModal={handleSubmitModal}
            fetchUserWork={fetchUserWork}
          />
        </div>
        <div
          className={`modal see-work-description ${
            descriptionModal ? "active" : null
          }`}
        >
          <JobDescription
            workingOrder={workingOrder}
            handleDescriptionModal={handleDescriptionModal}
          />
        </div>
      </div>
    </div>
  );
};

export default CompletedOrders;
