import express from "express";
import admin from "firebase-admin";
import fs from "fs";

const app = express();
app.use(express.json());

// 🔑 讀取 Render 的 Secret file
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync("/etc/secrets/firebase.json", "utf8"))
  )
});

// 👉 測試用推播 API
app.post("/push", async (req, res) => {
  const { token } = req.body;

  try {
    await admin.messaging().send({
      token,
      notification: {
        title: "🚨 地震速報測試",
        body: "如果你看到這個，代表推播成功！"
      }
    });

    res.send("✅ 推播成功");
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
