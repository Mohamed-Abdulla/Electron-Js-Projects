const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

// console.log(versions.node());

const loadImage = (e) => {
  const file = e.target.files[0];
  //   console.log(file);

  // Check if file is an image
  if (!isFileImage(file)) {
    alertError("please select an image");
    return;
  }

  //get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };
  form.style.display = "block";
  filename.innerText = file.name;
  // console.log(os.homedir());
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
};

//sending data to main.js
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;
  // console.log("imgPath", imgPath);

  if (!img.files[0]) {
    alertError("Please upload image ");
    return;
  }

  if (width === "" || height === "") {
    alertError("Please fill in a height and width");
    return;
  }

  //send to main using ipc renderer
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

// When done, show message
ipcRenderer.on("image:done", () => alertSuccess(`Image resized to ${heightInput.value} x ${widthInput.value}`));

// Make sure file is an image

function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"];

  return file && acceptedImageTypes.includes(file["type"]);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
