const optionsContainer = document.getElementById('optionsContainer');
var settings = JSON.parse(localStorage["settings"]);
const options = Object.keys(settings);
options.forEach(option => {
    optionsContainer.innerHTML += `
    <div class="option">
        <label class="switch">
            <input type="checkbox" class="input">
            <span class="slider round"></span>
        </label>     
        <h2>${option}</h2>         
    </div>`
})

const optionBlocks = document.getElementsByClassName("option");

var i = 0;
Array.from(optionBlocks).forEach(optionBlock => {
    optionBlock.getElementsByClassName("input")[0].checked = settings[Object.keys(settings)[i]];
    i++;
})

function autoUpdateSettings() {
    var i = 0;
    Array.from(optionBlocks).forEach(optionBlock => {
        settings[Object.keys(settings)[i]] = optionBlock.getElementsByClassName("input")[0].checked;
        i++;
    })
    localStorage["settings"] = JSON.stringify(settings);
    window.requestAnimationFrame(autoUpdateSettings);
}

autoUpdateSettings();