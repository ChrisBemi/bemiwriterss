import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../../Config";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import BindingModal from "./BindingModal";
import ".././Clients.css";
import "./GetOrders.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JSZip from "jszip";
import formatDate from "../../../utils/FormatDate";
import JobDescription from "../../../components/Admin/JobDescription";

import useUser from "../../../userUser";

import headers from "../../../headers";

import Preloader from "../../../Preloader/Preloader";

import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";

import { useSelector, useDispatch } from "react-redux";

const GetOrders = () => {
  const [bindModal, showBindModal] = useState(false);
  const [work, setWork] = useState([]);
  const [sidebar, showSidebar] = useState(false);
  const [workingOrder, setWorkingOrder] = useState(null);
  const [job, setJob] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [isTimeExpired, setTimeExpired] = useState(false);
  const [descriptionModal, showDescriptionModal] = useState(false);

  const dispatch = useDispatch();

  const loading = useSelector((state) => state.alerts.loading);

  const handleShowBindModal = () => {
    showBindModal(!bindModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const handleOrderToBind = (job) => {
    setJob(job);
  };

  const fetchWriters = async () => {
    try {
      dispatch(showLoading());

      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/get/unassigned`,
        {
          headers,
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        setWork(response.data.data || []);
      } else {
        toast.error("There was a problem fetching data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("There was a problem accessing the server");
    }
  };

  const calculateRemainingTime = (dueDate, time, charges, penalty) => {
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

    if (overdue && penalty >= charges) {
      return {
        timeString: "The penalty has equaled the charge of the job",
        overdue: false,
        minutes: 0,
      };
    }

    const timeString = overdue ? (
      <p className="description" style={{ color: "var(--pinkRed)" }}>
        Expired {days}d {hours}h {minutes}m {seconds}s ago
      </p>
    ) : (
      <p className="description" style={{ color: "var(--success-color)" }}>
        {days}d {hours}h {minutes}m {seconds}s
      </p>
    );

    return {
      timeString,
      overdue,
      minutes: Math.floor(absDistance / (1000 * 60)),
    };
  };

  useEffect(() => {
    fetchWriters();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prevCountdowns) => {
        const updatedCountdowns = work.reduce((acc, order) => {
          const { timeString, overdue, minutes } = calculateRemainingTime(
            order.dateline,
            order.time,
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
  }, [work]);

  const handleWorkingWork = (order) => {
    setWorkingOrder(order);
  };

  const checkIfUserHasBid = (order) => {
    if (!sessionStorage.getItem("userId") || !order.writers) {
      return false;
    }
    return order.writers.some(
      (writer) => writer._id === sessionStorage.getItem("userId")
    );
  };

  const handleDescriptionModal = () => {
    showDescriptionModal(!descriptionModal);
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
        }
      });

      await Promise.all(promises);

      zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.setAttribute(
          "download",
          `${subject}_${name}_assignment_files.zip`
        );

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
    }
  };

  return (
    <>
      <div className="orders account">
        <AccountNavbar
          sidebar={sidebar}
          handleShowSidebar={handleShowSidebar}
          title="GET ORDERS"
        />
        <AccountSidebar sidebar={sidebar} />
        <div className="container">
          <p className="empty"></p>
          <p className="medium-header" style={{ color: "var(--blue)" }}>
            Once you have placed a bid and the company has assigned you the
            work,
            <br />
            The order will reflect In progress page!
            <br />
            Kindly submit the work on time! Any delay will cost you 5 shillings
            per minute
          </p>
          {work.length > 0 && (
            <div className="table_wrapper">
              <table>
                <thead>
                  <tr>
                    <td>Index</td>
                    <td>Topic, Order ID</td>
                    <td>Paper Details</td>
                    <td>Uploaded At</td>
                    <td>Due Date</td>
                    <td>Pages</td>
                    <td>Words</td>
                    <td>Charge</td>
                    <td>
                      <p>Download</p>
                      <p>Instructions</p>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {work.map(
                    (order, index) =>
                      !checkIfUserHasBid(order) && (
                        <tr key={order._id}>
                          <td>
                            <p className="description">{index + 1}</p>
                          </td>
                          <td>
                            <p className="description">{order.subject}</p>
                            {order.orderId ? (
                              <p className="description">{`Order ID: ${order.orderId}`}</p>
                            ) : (
                              <p className="description">{`Order ID: ${order._id}`}</p>
                            )}
                          </td>
                          <td>
                            <p className="description">{order.category}</p>
                            <p className="description">
                              <button
                                className="table-btn"
                                style={
                                  checkIfUserHasBid(order)
                                    ? {
                                        background: "transparent",
                                        color: "var(--pinkRed)",
                                      }
                                    : null
                                }
                                onClick={() => {
                                  handleShowBindModal();
                                  handleOrderToBind(order);
                                }}
                              >
                                {checkIfUserHasBid(order) ? "cancel" : "BID"}
                              </button>
                            </p>
                          </td>

                          <td>
                            <p className="description">
                              {formatDate(order.createdAt)}
                            </p>
                          </td>

                          <td>
                            <div className="time-container">
                              <p className="description">
                                Submit by: {order.dateline.split("T")[0]} at{" "}
                                {order.time}
                              </p>
                              {countdowns[order._id]?.overdue ? (
                                <p className="description">Expired</p>
                              ) : (
                                <p className="description">
                                  {countdowns[order._id]?.timeString}
                                </p>
                              )}
                              <p className="description">Time: {order.time}</p>
                            </div>
                          </td>
                          <td>
                            <p className="description descriptive-text">
                              {order.page}
                            </p>
                          </td>
                          <td>
                            <p className="description descriptive-text">
                              {order.words}
                            </p>
                          </td>

                          <td>
                            <p className="description descriptive-text">{`Sh.${order.charges}`}</p>
                          </td>
                          <td>
                            <div className="navigation-buttons">
                              {order?.description && (
                                <button
                                  className="table-btn"
                                  style={{
                                    background: "var(--blue)",
                                    border: "2px solid var(--blue)",
                                  }}
                                  onClick={() => {
                                    handleWorkingWork(order);
                                    handleDescriptionModal();
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
                                      "Assignment"
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
                      )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {loading && <Preloader />}
          <div
            className={`modal get-orders ${descriptionModal ? "active" : null}`}
          >
            <JobDescription
              workingOrder={workingOrder}
              handleDescriptionModal={handleDescriptionModal}
            />
          </div>
        </div>
        <BindingModal
          handleShowBindModal={handleShowBindModal}
          bindModal={bindModal}
          job={job}
          fetchWriters={fetchWriters}
        />
      </div>
      <ToastContainer />
    </>
  );
};

export default GetOrders;
