const DateGenerator = () => {
  const currentDate = new Date();
  const localDateTime = currentDate.toLocaleString();
  return localDateTime
};
module.exports = DateGenerator;
