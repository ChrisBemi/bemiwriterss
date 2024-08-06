const ApiMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.APIS_KEY;
  const contentType = req.headers["content-type"];

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ message: "Unauthorized: Invalid API key" });
  }

  if (["POST", "PUT", "PATCH", "DELETE", "GET"].includes(req.method)) {
    if (
      contentType &&
      !contentType.startsWith("application/json") &&
      !contentType.startsWith("multipart/form-data") &&
      !contentType.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
      return res.status(415).json({
        message:
          "Unsupported Media Type: Expected application/json, multipart/form-data, or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }
  }

  next();
};

module.exports = { ApiMiddleware };
