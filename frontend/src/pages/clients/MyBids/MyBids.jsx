import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../../Config";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import ".././Clients.css";
import "../GetOrders/GetOrders.css";

import { ToastContainer, toast } from "react-toastify";

import headers from "../../../headers";

import "react-toastify/dist/ReactToastify.css";

import formatDate from "../../../utils/FormatDate";

const MyBids = () => {
  const [bindModal, showBindModal] = useState(false);

  const [work, setWork] = useState([]);
  const [sidebar, showSidebar] = useState(false);

  const handleShowBindModal = () => {
    showBindModal(!bindModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchWriters = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/get/unassigned`,{
          headers
        }
      );

      if (response.data.success) {
        setWork(response.data.data);
      } else {
        console.log("There was a network problem fetching data");
      }
    } catch (error) {
      console.log("There was a problem accessing the server");
    }
  };

  const cancelBind = async (id) => {
    try {
      const response = await axios.get(
        `${
          Config.baseUrl
        }/api/assignments/remove-bind/${id}/${sessionStorage.getItem(
          "userId"
        )}`,
        {
          headers,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchWriters();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(`Error cancelling bind: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchWriters();
    const interval = setInterval(fetchWriters, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateRemainingTime = (dueDate, time) => {
    const now = new Date().getTime();
    const dueDateTime = new Date(dueDate).getTime();
    const distance = dueDateTime - now;

    if (distance < 0) {
      return "Expired";
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const checkIfUserHasBid = (order) => {
    if (!order.writers) {
      return false;
    }
    return order.writers.some(
      (writer) =>
        writer._id === sessionStorage.getItem("userId") && !order.assigned
    );
  };

  return (
    <>
      <div className="orders account">
        <AccountNavbar
          sidebar={sidebar}
          handleShowSidebar={handleShowSidebar}
          title="MY BIDS"
        />
        <AccountSidebar sidebar={sidebar} />
        <div className="container">
          <ToastContainer />
          <p className="empty"></p>
          {work && (
            <div className="table_wrapper">
              <table>
                <thead>
                  <tr>
                    <td>Topic, Order ID</td>
                    <td>Uploaded At</td>
                    <td>Paper Details</td>
                    <td>Due Date</td>
                    <td>Pages</td>
                    <td>Words</td>

                    <td>Charge</td>
                  </tr>
                </thead>
                <tbody>
                  {work.map((order, index) =>
                    checkIfUserHasBid(order) ? (
                      <tr key={order._id}>
                        <td>
                          <p className="description">{order.subject}</p>
                          {order.orderId ? (
                            <p className="description">{`Order ID: ${order.orderId}`}</p>
                          ) : (
                            <p className="description">{`Order ID: ${order._id}`}</p>
                          )}
                        </td>
                        <td>
                          <td>
                            <p>{formatDate(order.createdAt)}</p>
                          </td>
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
                                cancelBind(order._id);
                              }}
                            >
                              {checkIfUserHasBid(order) ? "cancel" : "BID"}
                            </button>
                          </p>
                        </td>
                        <td>
                          <div className="time-container">
                            <p className="description">
                              Submit by: {order.time}
                            </p>
                            {calculateRemainingTime(
                              order.dateline,
                              order.time
                            ).includes("Expired") ? (
                              <p className="description">Expired</p>
                            ) : (
                              <p className="description">
                                In{" "}
                                {calculateRemainingTime(
                                  order.dateline,
                                  order.time
                                )}
                              </p>
                            )}
                            <p className="description">Time: {order.time}</p>
                          </div>
                        </td>
                        <td className="description">{order.page}</td>
                        <td className="description">{order.words}</td>

                        <td className="description">{`Sh.${order.charges}`}</td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyBids;
