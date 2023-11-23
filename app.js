const LS_KEY_PREFIX = "v1.editor.aruco.fodi.be";
const LS_KEY_SUFFIX_RESOLUTION = ".resolution";

let currentResolution = parseInt(localStorage.getItem(LS_KEY_PREFIX + LS_KEY_SUFFIX_RESOLUTION)) || 5; // try to load last used resolution from local storage or fall back to default value
let currentMode; // current painting mode, either "dark" or "light"
let currentCodeBin, currentCodeHex; // binary / hexadecimal representation of the current marker

// utility functions
const hex2bin = (hexString, numberOfBits) => parseInt(hexString, 16).toString(2).padStart(numberOfBits, "0");
const bin2hex = (binString) => "0x" + parseInt(binString, 2).toString(16) + "UL";

// table setup
const initTable = (resolution) => {

    if (!parseInt(resolution)) { // fail if requested resolution cannot be parsed as an integer
        alert("Invalid resolution.");
        return;
    }

    currentResolution = resolution;

    localStorage.setItem(LS_KEY_PREFIX + LS_KEY_SUFFIX_RESOLUTION, currentResolution); // save current resolution to local storage it can be automatically set on a page refresh

    document.querySelector(":root").style.setProperty("--grid-resolution", resolution);

    // generate table HTML
    let tableHTML = "<table>";
    for (let y = 0; y < resolution; y++) {
        tableHTML += "<tr>";
        for (let x = 0; x < resolution; x++) {
            tableHTML += "<td id='cell" + (x + y) + "'></td>";
        }
        tableHTML += "</tr>";
    }
    tableHTML += "</table>";

    // add table HTML to DOM
    document.querySelector("#grid").innerHTML = tableHTML;

    // paint and rig table cells for interaction
    document.querySelectorAll("td").forEach((el) => {
        el.classList.add("dark"); // set default mode for all cells

        const ondown = (e) => {
            currentMode = e.target.classList.contains("dark") ? "light" : "dark";

            paintCell(e.target);

            el.onpointermove = onmove;
            el.setPointerCapture(e.pointerId);
        };

        const onup = (e) => {
            el.onpointermove = null;
            el.releasePointerCapture(e.pointerId);
            updateCode();
        };

        const onmove = (e) => {
            elRealTarget = document.elementFromPoint(e.x, e.y);
            if (e.buttons && elRealTarget.localName === 'td') {
                paintCell(elRealTarget);
            }
        };

        el.onpointerdown = ondown;
        el.onpointerup = onup;
    });

    updateCode();
};

// set one cell to the current mode (dark or light)
const paintCell = (el) => {
    if (currentMode === "light") {
        el.classList.remove("dark");
        el.classList.add("light");
    } else {
        el.classList.remove("light");
        el.classList.add("dark");
    }
};

// generate and display the hexadecimal representation of the current marker
const updateCode = () => {
    currentCodeBin = "";
    document.querySelectorAll("td").forEach((el) => {
        currentCodeBin += el.classList.contains("light") ? "1" : "0";
    });
    currentCodeHex = bin2hex(currentCodeBin);
    document.getElementById("grid-info").textContent = currentCodeHex;
};

// prompt user for new resolution and reinit
const setResolution = () => {
    const newResolution = prompt("This will clear the current code. Enter new resolution:", currentResolution);
    if (newResolution) {
        initTable(parseInt(newResolution));
    }
};

// init on load
initTable(currentResolution);
