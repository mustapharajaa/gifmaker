const defaultOpt = {
    quality: 1,
    width: 800,
    height: 800,
    background: "#fff",
    transparent: "#fff",
};
const container = document.querySelector(".grid");

// Basic check for Sortable
if (typeof Sortable !== 'undefined') {
    new Sortable(container, {
        animation: 150,
        ghostClass: "sortable-ghost",
    });
}

const speedEle = document.querySelector("#speed");
const resultEle = document.querySelector("#result");
const startEle = document.querySelector("#start");
const clearEle = document.querySelector("#clear");
const downloadEle = document.querySelector("#download");
const uploadEle = document.querySelector("#upload");

// Re-query items to ensure we have the live list
const getItems = () => Array.from(document.querySelectorAll(".item img"));
let items = getItems();

clearEle.addEventListener("click", () => {
    items.forEach((img) => {
        img.src = `upload-svgrepo-com.svg`;
        img.classList.replace("img", "img-small");
    });
    resultEle.style.display = "none";
    downloadEle.style.display = "none";
});

function setImg(file, imgEle) {
    const reader = new FileReader();
    reader.addEventListener("load", function (e) {
        const imageUrl = e.target.result;
        const img = new Image();

        img.addEventListener("load", function () {
            imgEle.src = img.src;
            imgEle.classList.replace("img-small", "img");
        });

        img.src = imageUrl;
    });
    reader.readAsDataURL(file);
}

uploadEle.addEventListener("change", () => {
    const files = uploadEle.files;
    if (files.length > 9) {
        alert("Maximum 9 images");
        uploadEle.value = "";
        return;
    }

    const clickitem = Number(uploadEle.getAttribute("data-clickitem"));
    if (files.length === 1) {
        setImg(files[0], items[clickitem]);
        return;
    }

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

function createGif(options) {
    const opt = {
        ...defaultOpt,
        ...options,
        workerScript: 'gif.worker.js' // Fix for Vercel/Production
    };
    const gif = new GIF(opt);
    const delay = Number(speedEle.value) * 100;

    // Use live DOM order in case they were sorted
    const currentItems = getItems();
    currentItems.forEach((item) => {
        if (item.classList.contains("img")) {
            gif.addFrame(item, { delay });
        }
    });

    gif.on("finished", finishCreate);
    gif.render();
}

function startCreate() {
    resultEle.style.display = "inline-block";
    resultEle.src = "loading.svg";
    resultEle.classList.add("loading");
    downloadEle.style.display = "none";
}

function finishCreate(blob) {
    resultEle.classList.remove("loading");
    resultEle.src = URL.createObjectURL(blob);
    downloadEle.style.display = "block";
}

function getOpt(img) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const opt = {};

    if (width && width !== 800) {
        opt.width = width;
    }

    if (height && height !== 800) {
        opt.height = height;
    }

    return opt;
}

startEle.addEventListener("click", () => {
    startCreate();
    const firstImg = items.find(img => img.classList.contains("img")) || items[0];
    createGif(getOpt(firstImg));
});

downloadEle.addEventListener("click", () => {
    const url = resultEle.src;
    if (!url || resultEle.src.includes("loading.svg")) {
        return alert("Create Gif First");
    }
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "gif.gif");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
});

speedEle.addEventListener("input", () => {
    speedEle.setAttribute("data-speed", speedEle.value);
});
