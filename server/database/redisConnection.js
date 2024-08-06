require("dotenv").config();
const redis = require("redis");

const redisClient = redis.createClient(process.env.REDIS_PORT);

const redisConnection = async () => {
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
  console.log("Connected to Redis successfully!");
};





module.exports = { redisClient,redisConnection }