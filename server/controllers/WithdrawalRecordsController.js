const Withdrawal = require("../models/Withdrawal.model");
const User = require("../models/Users.model");
const ExcelJS = require("exceljs");

const DownloadWithdrawalsRecords = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find().exec();

    const userIds = [...new Set(withdrawals.map((w) => w.writer.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).exec();
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = {
        name: `${user.firstName} ${user.lastName}`,
        systemId: user.systemId
      };
      return map;
    }, {});

    const clearedWithZeroBalance = withdrawals.filter(
      (withdrawal) => withdrawal.cleared && withdrawal.balance === 0
    );
    const clearedWithNonZeroBalance = withdrawals.filter(
      (withdrawal) => withdrawal.cleared && withdrawal.balance !== 0
    );
    const notCleared = withdrawals.filter((withdrawal) => !withdrawal.cleared);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Withdrawals");

    const addHeader = (worksheet, rowIndex, includeClearedOn = true) => {
      const headerRow = worksheet.getRow(rowIndex);
      headerRow.values = includeClearedOn
        ? [
            "Writer Name",
            "Writer ID",
            "Requested Amount",
            "Phone Number",
            "Pending",
            "Requested On",
            "Cleared On",
            "Amount Paid",
            "Balance",
          ]
        : [
            "Writer Name",
            "Writer ID",
            "Requested Amount",
            "Phone Number",
            "Pending",
            "Requested On",
            "Amount Paid",
            "Balance",
          ];
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0000FF" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    };

    const applyAlternateRowColor = (row, index) => {
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEEEEEE" },
          };
        });
      }
    };

    const addSectionTitle = (worksheet, title, rowIndex) => {
      const titleRow = worksheet.getRow(rowIndex);
      titleRow.values = [title];
      titleRow.font = { bold: true, size: 16 };
      titleRow.alignment = { horizontal: "left" };
      worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
      titleRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDDDDD" },
        };
      });
    };

    const columnWidths = {
      writerName: 30,
      writer: 20,
      requestedAmount: 20,
      phoneNo: 30,
      pending: 15,
      requestedOn: 30,
      clearedOn: 30,
      amountPaid: 20,
      balance: 20,
    };

    worksheet.columns = [
      { header: "Writer Name", key: "writerName", width: columnWidths.writerName },
      { header: "Writer ID", key: "writer", width: columnWidths.writer },
      { header: "Requested Amount", key: "requestedAmount", width: columnWidths.requestedAmount },
      { header: "Phone Number", key: "phoneNo", width: columnWidths.phoneNo },
      { header: "Pending", key: "pending", width: columnWidths.pending },
      { header: "Requested On", key: "requestedOn", width: columnWidths.requestedOn },
      { header: "Cleared On", key: "clearedOn", width: columnWidths.clearedOn },
      { header: "Amount Paid", key: "amountPaid", width: columnWidths.amountPaid },
      { header: "Balance", key: "balance", width: columnWidths.balance },
    ];

    let currentRow = 1;

    addSectionTitle(worksheet, "Withdrawals Cleared and Balances 0", currentRow++);
    addHeader(worksheet, currentRow++, true);
    clearedWithZeroBalance.forEach((withdrawal, index) => {
      const row = worksheet.addRow({
        writerName: userMap[withdrawal.writer.toString()]?.name || '',
        writer: userMap[withdrawal.writer.toString()]?.systemId || '',
        requestedAmount: withdrawal.amount,
        phoneNo: withdrawal.phoneNo,
        pending: withdrawal.pending,
        requestedOn: withdrawal.requestedOn
          ? new Date(withdrawal.requestedOn).toLocaleDateString()
          : "",
        clearedOn: withdrawal.clearedOn
          ? new Date(withdrawal.clearedOn).toLocaleDateString()
          : "",
        amountPaid: withdrawal.amountPaid,
        balance: withdrawal.balance,
      });
      applyAlternateRowColor(row, index);
      currentRow++;
    });

    currentRow++;

    addSectionTitle(worksheet, "Withdrawals Cleared and Balance Not 0", currentRow++);
    addHeader(worksheet, currentRow++, true);
    clearedWithNonZeroBalance.forEach((withdrawal, index) => {
      const row = worksheet.addRow({
        writerName: userMap[withdrawal.writer.toString()]?.name || '',
        writer: userMap[withdrawal.writer.toString()]?.systemId || '',
        requestedAmount: withdrawal.amount,
        phoneNo: withdrawal.phoneNo,
        pending: withdrawal.pending,
        requestedOn: withdrawal.requestedOn
          ? new Date(withdrawal.requestedOn).toLocaleDateString()
          : "",
        clearedOn: withdrawal.clearedOn
          ? new Date(withdrawal.clearedOn).toLocaleDateString()
          : "",
        amountPaid: withdrawal.amountPaid,
        balance: withdrawal.balance,
      });
      applyAlternateRowColor(row, index);
      currentRow++;
    });

    currentRow++;

    addSectionTitle(worksheet, "Withdrawals Not Cleared", currentRow++);
    addHeader(worksheet, currentRow++, false);
    notCleared.forEach((withdrawal, index) => {
      const row = worksheet.addRow({
        writerName: userMap[withdrawal.writer.toString()]?.name || '',
        writer: userMap[withdrawal.writer.toString()]?.systemId || '',
        requestedAmount: withdrawal.amount,
        phoneNo: withdrawal.phoneNo,
        pending: withdrawal.pending,
        requestedOn: withdrawal.requestedOn
          ? new Date(withdrawal.requestedOn).toLocaleDateString()
          : "",
        clearedOn: "", 
        amountPaid: withdrawal.amountPaid,
        balance: withdrawal.balance,
      });
      applyAlternateRowColor(row, index);
      currentRow++;
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=withdrawals_history.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("There was an error generating the excel file:", error);
    next(error);
  }
};

module.exports = { DownloadWithdrawalsRecords };
