import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import fs from "fs";

const app = express();
app.use(express.json());

// Firebase 金鑰（下一步會給）
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync("firebase.json"))
  )
});

let lastEventId = null;

async function checkEEW() {
  try {
    const res = await fetch(
      "https://twearthquake.zapto.org:30007/api/web/initialization"
    );
    const init = await res.json();
    const apiUrl = init.url;

    const eewRes = await fetch(apiUrl + "/Taipei0");
    const data = await eewRes.json();

    if (data.HasEarthquake) {
      const eq = data.Earthquake;
      if (eq.id !== lastEventId) {
        lastEventId = eq.id;

        await admin.messaging().send({
          topic: "eew",
          notification: {
            title: "⚠ 地震速報",
            body: `${eq.address} M${eq.scale}，${eq.second} 秒後到達`
          }
        });

        console.log("已推播地震速報");
      }
    }
  } catch (e) {
    console.error("EEW error", e.message);
  }
}

// 每 1 秒檢查
setInterval(checkEEW, 1000);

app.get("/", (_, res) => res.send("EEW server running"));
app.listen(3000);
