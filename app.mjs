const container = document.querySelector(".grid");

const speedEle = document.querySelector("#speed");
const resultEle = document.querySelector("#result");
const clearEle = document.querySelector("#clear");
const startEle = document.querySelector("#start");
const uploadEle = document.querySelector("#upload");
const downloadEle = document.querySelector("#download");
const popupMessage = document.querySelector("#popup-message");

function showPopup(msg) {
    if (!popupMessage) return;
    popupMessage.textContent = msg;
    popupMessage.style.display = "block";
    setTimeout(() => {
        popupMessage.style.display = "none";
    }, 3000);
}

// Make result visible immediately, we don't need a backend GIF
resultEle.style.display = "inline-block";
if (downloadEle) downloadEle.style.display = "inline-block"; // Show download button

const getItems = () => Array.from(document.querySelectorAll(".item img"));
let items = getItems();

// Initialize Sortable for drag-and-drop
if (typeof Sortable !== 'undefined') {
    new Sortable(container, {
        animation: 150,
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        forceFallback: true,
        onEnd: () => {
            items = getItems();
            startInstantLoop();
        }
    });
}

function setImg(file, imgEle) {
    const reader = new FileReader();
    reader.addEventListener("load", function (e) {
        const imageUrl = e.target.result;
        imgEle.src = imageUrl;
        imgEle.classList.replace("img-small", "img");
        startInstantLoop();
    });
    reader.readAsDataURL(file);
}

uploadEle.addEventListener("change", () => {
    const files = uploadEle.files;
    const clickitem = Number(uploadEle.getAttribute("data-clickitem"));
    Array.from(files).forEach((file, idx) => {
        if (items[idx + clickitem]) {
            setImg(file, items[idx + clickitem]);
        }
    });
});

items.forEach((ele, idx) => {
    ele.parentElement.addEventListener("click", () => {
        uploadEle.setAttribute("data-clickitem", idx);
        uploadEle.click();
    });
});

let loopInterval = null;
let currentLoopIdx = 0;

function startInstantLoop() {
    if (loopInterval) clearInterval(loopInterval);
    
    // Always fetch latest items order
    items = getItems();
    
    // Use all images present in the grid
    const activeItems = items.filter(img => img.classList.contains("img") || img.src.includes(".svg"));
    
    if (activeItems.length === 0) return;

    // Use speed slider value for interval delay
    const delay = Math.max(50, Number(speedEle.value) * 100);
    
    // Force the first frame immediately
    resultEle.src = activeItems[currentLoopIdx % activeItems.length].src;

    // Start continuous looping
    loopInterval = setInterval(() => {
        currentLoopIdx = (currentLoopIdx + 1) % activeItems.length;
        resultEle.src = activeItems[currentLoopIdx].src;
    }, delay);
}

clearEle.addEventListener("click", () => {
    items.forEach((img) => {
        img.src = `upload-svgrepo-com.svg`;
        img.classList.replace("img", "img-small");
    });
    startInstantLoop();
});

speedEle.addEventListener("input", () => {
    speedEle.setAttribute("data-speed", speedEle.value);
    startInstantLoop();
});

let generatedBlobUrl = null;

startEle.addEventListener("click", () => {
    const activeItems = items.filter(img => img.classList.contains("img") || img.src.includes(".svg"));
    if (activeItems.length === 0) return showPopup("No images to process!");

    const originalText = startEle.textContent;
    startEle.textContent = "Generating...";
    startEle.disabled = true;

    // Show loading animation
    if (loopInterval) clearInterval(loopInterval);
    resultEle.src = "loading.svg";
    resultEle.classList.add("loading");
    downloadEle.style.display = "none";

    const delay = Math.max(50, Number(speedEle.value) * 100);
    const firstImg = activeItems[0];
    
    const opt = {
        quality: 1,
        width: firstImg.naturalWidth || 800,
        height: firstImg.naturalHeight || 800,
        background: "#fff",
        transparent: "#fff",
        repeat: 0,
        workerScript: 'gif.worker.js'
    };

    const gif = new GIF(opt);

    activeItems.forEach((item) => {
        gif.addFrame(item, { delay });
    });

    gif.on("finished", function(blob) {
        generatedBlobUrl = URL.createObjectURL(blob);
        startEle.textContent = originalText;
        startEle.disabled = false;
        downloadEle.style.display = "inline-block";
        
        // Remove loading animation and resume normal preview
        resultEle.classList.remove("loading");
        startInstantLoop();
    });

    gif.render();
});

downloadEle.addEventListener("click", () => {
    if (!generatedBlobUrl) return showPopup("Please click 'Create GIF' first to generate the file!");
    
    const link = document.createElement("a");
    link.href = generatedBlobUrl;
    link.setAttribute("download", "gif.gif");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
});

// Force the loop to start immediately upon loading
startInstantLoop();
document.addEventListener('DOMContentLoaded', startInstantLoop);
window.addEventListener('load', startInstantLoop);
