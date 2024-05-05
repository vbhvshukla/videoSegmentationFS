import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { stdout, stderr } from "process";
const app = express();

//Multer middleware

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + uuid() + path.extname(file.originalname));
  },
});

//Multer configuration

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: [
      "http://localhost:3000", // for the frontend server
      "http://localhost:5173", // for the frontend server
    ],
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  //This sets the Access-Control-Allow-Origin header in the response to *, allowing requests from any origin
  res.header("Access-Control-Allow-Origin", "*");
  //This sets the Access-Control-Allow-Headers header in the response to specify which headers can be used during the actual request.
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  //This calls the next middleware function in the stack.
  next();
});

//This middleware parses incoming requests with JSON payloads. It parses the JSON data and makes it available in req.body.
app.use(express.json());

//This middleware parses incoming requests with URL-encoded payloads. It parses the URL-encoded data and makes it available in req.body. The extended: true option allows for parsing of nested objects, while extended: false (or omitting it) only parses simple key-value pairs.
app.use(express.urlencoded({ extended: true }));

//GET Req at /
app.get("/", function (req, res) {
  res.json({ message: "Hello World" });
});

//Post Route for upload

app.post("/upload", upload.single("file"), function (req, res) {
  // convert video in HLS format
  const lessonId = uuid();
  const videoPath = req.file.path;
  const outputPath = `./uploads/course/${lessonId}`;
  const hlsPath = `${outputPath}/index.m3u8`;
  console.log("hlsPath", hlsPath);

  // if the output directory doesn't exist, create it
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // command to convert video to HLS format using ffmpeg

  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  console.log("File uploaded successfully!");
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    const videoUrl = `http://localhost:8000/uploads/course/${lessonId}/index.m3u8`;
    res.json({
      message: "Video converted to HLS format",
      videoUrl: videoUrl,
      lessonId: lessonId,
    });
  });
});

//Listen on Port 8000
app.listen(8000, function () {
  console.log("Server is listening at port 8000");
});
