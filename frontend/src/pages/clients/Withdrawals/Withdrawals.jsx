import React, { useState, useEffect } from "react";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import axios from "axios";
import WithDrawalForm from "./WithDrawalForm";
import ".././Clients.css";
import "./Withdrawals.css";
import formatDate from "../../../utils/FormatDate";
import headers from "../../../headers";
import Preloader from "../../../Preloader/Preloader";
import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
const Withdrawals = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const [sidebar, showSidebar] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchPendingWithdrawals = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(
        `${Config.baseUrl}/api/withdraw/get/${sessionStorage.getItem(
          "userId"
        )}`,
        { headers }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        setWithdrawals(response.data.data);
      }
    } catch (error) {
      console.log(`There was an error fetching withdrawals from the backend`);
      dispatch(hideLoading());
    }
  };

  const deleteWithdrawal = async (withdrawalId) => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/withdraw/${withdrawalId}/clear/user-history`,
        {
          headers,
        }
      );
      console.log(response.data);
      if (response.data.success) {
        await fetchPendingWithdrawals();
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clearWritersWithdrawalHistory = async () => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/withdraw/${sessionStorage.getItem(
          "userId"
        )}/clear/history`,
        {},
        { headers }
      );

      if (response.data.success) {
        console.log(response.data.message);
        fetchPendingWithdrawals();
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(
        `There was an error clearing the writer's history: ${error.message}`
      );
    }
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    fetchPendingWithdrawals();
  }, []);

  useEffect(() => {
    const pendingWithdrawals = withdrawals.filter(
      (withdrawal) => withdrawal.pending
    );
    setPendingWithdrawals(pendingWithdrawals);
  }, [withdrawals]);

  return (
    <div className="account withdrawal">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="WITHDRAWALS"
      />
      <AccountSidebar sidebar={sidebar} />
      <p className="empty"></p>

      <div className="container">
        <p className="large-headers">WITHDRAWAL MONEY</p>
        <p className="medium-header">
          Note all money will be sent via M-PESA,
          <br /> So only provide SAFARICOM NUMBER!
          <br />
        </p>
        <div className="grid">
          <div className="pending table_wrapper">
            <p className="large-headers">YOUR PENDING WITHDRAWALS</p>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table-container">
                <thead>
                  <tr>
                    <td>Requested</td>
                    <td>Date</td>
                    <td>No</td>
                    <td>Paid on</td>
                    <td>Paid</td>
                    <td>Balance</td>
                  </tr>
                </thead>
                <tbody>
                  {pendingWithdrawals.length > 0 ? (
                    pendingWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal._id}>
                        <td>
                          <p className="description">
                            {withdrawal.requestedAmount}
                          </p>
                        </td>
                        <td>
                          <p className="description">
                            {formatDate(withdrawal.requestedOn)}
                          </p>
                        </td>
                        <td>
                          <p className="description">{withdrawal.phoneNo}</p>
                        </td>
                        <td>
                          <p className="description">
                            {withdrawal?.clearedOn
                              ? formatDate(withdrawal.clearedOn)
                              : "Not Paid"}
                          </p>
                        </td>
                        <td>
                          <p className="description">
                            {withdrawal?.amountPaid
                              ? withdrawal.amountPaid
                              : "Not Paid"}
                          </p>
                        </td>
                        <td>
                          <p className="description">{withdrawal?.balance}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="description">
                        No pending withdrawals
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <WithDrawalForm fetchPendingWithdrawals={fetchPendingWithdrawals} />
        </div>
        <button
          className="table-btn"
          style={{ marginTop: "2rem" }}
          onClick={() => {
            clearWritersWithdrawalHistory();
          }}
        >
          Clear all history!
        </button>
        <div className="table_wrapper">
          <table className="table-container">
            <thead>
              <tr>
                <td>Requested amount</td>
                <td>Requested on</td>
                <td>No</td>
                <td>Paid On</td>
                <td>Amount Paid</td>
                <td>Balance</td>
                <td>Delete</td>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id}>
                  <td>
                    <p className="description">{withdrawal.requestedAmount}</p>
                  </td>
                  <td>
                    <p className="description">
                      {formatDate(withdrawal.requestedOn)}
                    </p>
                  </td>
                  <td>
                    <p className="description">{withdrawal.phoneNo}</p>
                  </td>
                  <td>
                    <p className="description">
                      {withdrawal?.clearedOn
                        ? formatDate(withdrawal.clearedOn)
                        : "Not Paid"}
                    </p>
                  </td>
                  <td>
                    <p className="description">{withdrawal.amountPaid}</p>
                  </td>
                  <td>
                    <p className="description">{withdrawal.balance}</p>
                  </td>
                  <td>

                    { withdrawal.cleared ? <button
                      className="table-btn"
                      onClick={() => {
                        deleteWithdrawal(withdrawal._id);
                      }}
                    >
                      Delete
                    </button> : <p className="description">Not paid yet</p>  }
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {loading && <Preloader />}
    </div>
  );
};

export default Withdrawals;
