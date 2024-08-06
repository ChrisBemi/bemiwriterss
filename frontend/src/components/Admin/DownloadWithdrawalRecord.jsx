import axios from "axios";
import Config from "../../Config";
import React from "react";

const DownloadWithdrawalRecord = () => {
  const downloadRecord = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/withdraw/download/history`,
        {
          responseType: "blob",
          headers: {
          "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "withdrawal_history.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("There was an error downloading the record!", error);
    }
  };

  return (
    <button
      className="table-btn"
      style={{ marginBottom: "0.5rem" }}
      onClick={downloadRecord}
    >
      Download withdrawal history
    </button>
  );
};

export default DownloadWithdrawalRecord;
