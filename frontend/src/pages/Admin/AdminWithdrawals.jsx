import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./Admin.css";
import "./AddWrite.css";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import PayWriter from "../../components/Admin/PayWriter";
import "./AdminWithdrawal.css";
import DownloadWithdrawalRecord from "../../components/Admin/DownloadWithdrawalRecord";
import formatDate from "../../utils/FormatDate";
import headers from "../../headers";
import Preloader from "../../Preloader/Preloader";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import { useDispatch, useSelector } from "react-redux";
import DeleteWithdrawals from "../../components/Admin/DeleteWithdrawals";
const AdminWithdrawal = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const [withdrawals, setWithdrawals] = useState(null);
  const [sidebar, showSidebar] = useState(false);
  const [payModal, showPayModal] = useState(false);
  const [writerToPay, setWriterToPay] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteWithdrawalModal, showDeleteModal] = useState(false);

  const handleDeleteModal = () => {
    showDeleteModal(!deleteWithdrawalModal);
  };

  const handleWriterToPay = (writer) => {
    setWriterToPay(writer);
  };

  const handleShowPayModal = () => {
    showPayModal(!payModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchPendingWithdrawals = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(`${Config.baseUrl}/api/withdraw/get`, {
        headers,
      });
      dispatch(hideLoading());
      if (response.data.success) {
        setWithdrawals(response.data.data);
      } else {
        console.log(`There were network issues fetching data from the backend`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((itemId) => itemId !== id)
        : [...prevSelected, id]
    );
  };

  const deleteWithdrawals = async () => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/withdraw/delete/withdrawals`,
        {
          data: {
            withdrawalIds: [...selectedIds], // Array of selected withdrawal IDs
          },
          headers,
        }
      );
      fetchPendingWithdrawals();
      console.log(response.data.message);
    } catch (error) {
      console.log("There was an error deleting the withdrawals:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      const allIds = withdrawals.map((withdrawal) => withdrawal._id);
      setSelectedIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, [sessionStorage.getItem("userId")]);

  return (
    <div className="admin withdrawals">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="ADMIN WITHDRAWALS"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <div className="controllers">
          <DownloadWithdrawalRecord />
          <button className="table-btn" onClick={handleSelectAll}>
            {selectAll ? "Deselect All" : "Select All"}
          </button>
          <button
            className="table-btn"
            onClick={() => {
              if (selectedIds.length > 0) {
                handleDeleteModal();
              }
            }}
          >
            Delete selected!
          </button>
        </div>
        <div className="table_wrapper">
          {withdrawals ? (
            <table>
              <thead>
                <tr>
                  <td>NAME</td>
                  <td>EMAIL</td>
                  <td>REQUESTED(SH)</td>
                  <td>PHONE NO</td>
                  <td>REQUESTED ON</td>
                  <td>CLEARED</td>
                  <td>CLEAR</td>
                  <td>CLEARED ON</td>
                  <td>PAID AMOUNT</td>
                  <td>BALANCE(SH)</td>
                  <td>SELECT</td>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id}>
                    <td>
                      <p className="description">
                        {withdrawal?.writer?.firstName ?? "N/A"}{" "}
                        {withdrawal?.writer?.lastName ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {withdrawal?.writer?.email ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p
                        className="description"
                        style={{
                          color: "var(--success-color)",
                          fontWeight: "600",
                        }}
                      >
                        {withdrawal?.requestedAmount ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {withdrawal?.phoneNo ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {formatDate(withdrawal?.requestedOn) ?? "N/A"}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {withdrawal?.cleared ? "True" : "False"}
                      </p>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        disabled={
                          withdrawal.cleared && withdrawal.balance === 0
                        }
                        style={
                          withdrawal.cleared
                            ? {
                                background: "var(--success-color)",
                                border: "2px solid var(--success-color)",
                              }
                            : null
                        }
                        onClick={() => {
                          handleShowPayModal();
                          handleWriterToPay(withdrawal);
                        }}
                      >
                        {withdrawal.cleared && withdrawal.balance === 0
                          ? "Cleared"
                          : "Clear"}
                      </button>
                    </td>
                    <td>
                      <p className="description">
                        {withdrawal.clearedOn
                          ? formatDate(withdrawal.clearedOn)
                          : "Not cleared"}
                      </p>
                    </td>
                    <td>
                      <p
                        className="description"
                        style={{ color: "var(--blue)", fontWeight: "600" }}
                      >
                        {withdrawal.amountPaid}
                      </p>
                    </td>
                    <td>
                      <p
                        className="description"
                        style={{ color: "var(--pinkRed)", fontWeight: "600" }}
                      >
                        {withdrawal.balance}
                      </p>
                    </td>
                    <td>
                      {withdrawal.cleared ? (
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            id={`checkbox-${withdrawal._id}`}
                            checked={selectedIds.includes(withdrawal._id)}
                            onChange={() =>
                              handleCheckboxChange(withdrawal._id)
                            }
                          />
                          <span className="checkmark"></span>
                          <p className="description">Select</p>
                        </label>
                      ) : (
                        "Not cleared!"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>NO WITHDRAWALS REQUESTS</p>
          )}
        </div>
      </div>

      <div className={`modal pay-writer ${payModal ? "active" : ""}`}>
        <PayWriter
          handleShowPayModal={handleShowPayModal}
          fetchPendingWithdrawals={fetchPendingWithdrawals}
          writerToPay={writerToPay}
        />
      </div>
      <div
        className={`modal delete-withdrawals ${
          deleteWithdrawalModal ? "active" : null
        }`}
      >
        <DeleteWithdrawals handleDeleteModal={handleDeleteModal} />
      </div>
      {loading && <Preloader />}
    </div>
  );
};

export default AdminWithdrawal;
