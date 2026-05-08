const container = document.querySelector(".grid");

const speedEle = document.querySelector("#speed");
const resultEle = document.querySelector("#result");
const clearEle = document.querySelector("#clear");
const uploadEle = document.querySelector("#upload");
const downloadEle = document.querySelector("#download");

// Make result visible immediately, we don't need a backend GIF
resultEle.style.display = "inline-block";
if (downloadEle) downloadEle.style.display = "none"; // Hide download since it's an instant preview

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

// Force the loop to start immediately upon loading
startInstantLoop();
document.addEventListener('DOMContentLoaded', startInstantLoop);
window.addEventListener('load', startInstantLoop);
