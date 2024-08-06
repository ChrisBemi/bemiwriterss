const convertDateTime = (dateTimeString) => {
  const assignedAt = new Date(dateTimeString);
  const date = assignedAt.toISOString().split("T")[0];
  const time = assignedAt.toISOString().split("T")[1].split(".")[0];
  return `${date} ${time}`;
};

export default convertDateTime;
