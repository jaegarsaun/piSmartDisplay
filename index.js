const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const path = require("node:path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 480,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Hot reload. Comment out when building for production
try {
  require("electron-reloader")(module);
} catch (_) {}

// Spotify access token request

ipcMain.on("request-spotify-token", (event, arg) => {
  const url = "https://accounts.spotify.com/api/token";
  const client_id = "34520f0d8a464e71a3856040ec2dd9df";
  const client_secret = "9e513028f65e41919fd210ca01b8906e";

  const data = new URLSearchParams();
  data.append("grant_type", "client_credentials");
  data.append("client_id", client_id);
  data.append("client_secret", client_secret);

  axios
    .post(url, data.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      event.reply("spotify-token-response", response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
