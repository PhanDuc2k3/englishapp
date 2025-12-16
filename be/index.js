const express = require("express");
const dotenv = require("dotenv");
dotenv.config(); // ✅ load .env TRƯỚC khi require db, routes, services
const connectDB = require("./db");
const app = express();
const cors = require("cors");

const userRouter = require("./Routes/UserRoutes");
const taskRouter = require("./Routes/TaskRoutes");
const questionRouter = require("./Routes/QuestionRoutes");
const giftRouter = require("./Routes/GiftRoutes");
const folderRouter = require("./Routes/FolderRoutes");

connectDB();

// CORS cho cả localhost (dev) và FE deploy trên Vercel
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://englishapp-fawn.vercel.app",
    ],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);
app.use("/api/question", questionRouter);
app.use("/api/gift", giftRouter);
app.use("/api/folder", folderRouter);
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Server chay tren cong: " + PORT);
})