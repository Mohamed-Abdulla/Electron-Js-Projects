//this is like backend
//for naming convention , main file name should be main.js

const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
let mainWindow;
//whenever we created a window ,we instansiated new browser window
// electron uses chromium and node under the hood

//create new window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 800 : 500,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //open dev tools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(path.join(__dirname, "./frontend/index.html"));
}

//create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./frontend/about.html"));
}

//whenever, app is ready ,call createMainWindow
app.whenReady().then(() => {
  createMainWindow();

  //implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //remove mainWindow from memory on close
  mainWindow.on("closed", () => mainWindow === null);

  //if app is running ,but there is no window, create new - this is for mac
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

//Menu Template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",

    //the above role is default

    // label: "File",
    // submenu: [
    //   {
    //     label: "Quit",
    //     click: () => app.quit(),
    //     accelerator: "CmdOrCtrl+W",
    //   },
    // ],
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

//respond to ipcRenderer resize
ipcMain.on("image:resize", (options) => {
  //adding destination path
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

//resize the image

async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      //convert string to number using +
      width: +width,
      height: +height,
    });
    console.log(newPath);

    //create filename
    const filename = path.basename(imgPath);
    console.log(filename);

    //create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //write file to destination
    fs.writeFileSync(path.join(dest, filename), newPath);

    //send a success to render
    mainWindow.webContents.send("image:done");

    //open the dest folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

//in mac ,even if we close, it still run on background,so make sure  that

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
