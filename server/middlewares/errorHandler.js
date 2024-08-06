const errorHandler = (error, req, res, next) => {
  console.error(error.stack)

  return res.status(500).json({ success: false, message: `${error.message}` })
}

module.exports = errorHandler
