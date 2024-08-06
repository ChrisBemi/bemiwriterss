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


  

  export default calculateRemainingTime