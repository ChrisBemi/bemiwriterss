const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const connectDatabase = require("../database/connectDatabase");
const errorHandler = require("../middlewares/errorHandler");
const admin = require("firebase-admin");
dotenv.config();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS);
const { redisClient, redisConnection } = require("../database/redisConnection");
const { ApiMiddleware } = require("../middlewares/ApiKeyMiddleware");

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  storageBucket: process.env.STORAGE_BUCKET,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

const allowedOrigins = [process.env.FRONTED_URL, "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/", ApiMiddleware);

const AuthenticationRoute = require("../routes/AuthenticationRoute");
const UserRoutes = require("../routes/UserRoutes");
const WritersRoute = require("../routes/WritersRoute");
const AnswersRoute = require("../routes/AnswersRoute");
const NotificationRoute = require("../routes/NotificationRoute");
const WithdrawalRoute = require("../routes/WithdrawalRoute");
const AssignmentRoute = require("../routes/AssignmentRoute");
const ProfileRoute = require("../routes/ProfileRoute");
const UpdateAssignmentRoute = require("../routes/UpdateAssignmentRoute");

const ApplicationsRoutes = require("../routes/ApplicationsRoutes");

app.use("/api/auth", AuthenticationRoute);
app.use("/api/users", UserRoutes);
app.use("/api/assignments", AssignmentRoute);
app.use("/api/writers", WritersRoute);
app.use("/api/answers", AnswersRoute);
app.use("/api/withdraw", WithdrawalRoute);
app.use("/api/notifications", NotificationRoute);
app.use("/api/profile", ProfileRoute);
app.use("/api/update", UpdateAssignmentRoute);
app.use("/api/applications", ApplicationsRoutes);

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: "Database instantiated properly" });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    await connectDatabase();
    console.log(`Server connected successfully at port: ${PORT}`);
  } catch (error) {
    console.error(`Error connecting to the database: ${error.message}`);
  }
});
