/*
    Description:
    Fish timer! User can give length of fish competition and stops for changing "bonus" fish. 
    It then displays how much is left of competition and bonus fish. Bonus fish is randomly changed.

    Functionality:
    Two sliders for timer and stops amount
    Stops are randomly placed between given time interval
    Stop event will play sound and display new bonus fish
*/

Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
}

// Get reference to elements
const timeSlider = document.querySelector("#time");
const stopSlider = document.querySelector("#stops");
const displayTime = document.querySelector("#clock-display");
const stopList = document.querySelector("#stops-list");
const displayStops = document.querySelector("#stops-display");
const playButton = document.querySelector("#play");
const resetButton = document.querySelector("#reset");
const showButton = document.querySelector("#show");
const runningClock = document.querySelector("#time-left");
const statusText = document.querySelector("#status");
const worker = new Worker('clock.js');

// Event listeners
playButton.addEventListener("click", startFishing);
resetButton.addEventListener("click", resetFishing);
showButton.addEventListener("click", toggleShowList);

worker.onmessage = function (e) {
    if (e.data.message === "UPDATE") {
        timer = e.data.time;
        checkEventTimer(stopEvents, timer);
        stringTime = timeInString(timer);
        runningClock.textContent = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
    }
}

timeSlider.oninput = function () {
    timer = minutesToHourMinSec(this.value);
    stringTime = timeInString(timer);
    displayTime.textContent = `${stringTime.hours}:${stringTime.minutes}`;
    runningClock.textContent = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
}

stopSlider.oninput = function () {
    stopsAmount = this.value;
    displayStops.textContent = this.value;
}

// Variables
const bells = new Audio(`mixkit-school-calling-bell-580.wav`);
const fishes = ["Hauki", "Ahven", "Taimen", "Kuha"];
let bonusFish;
let stopsAmount, toggleRaceOn, timer, stringTime
let stopEvents = [];

// Initial state for program.
startConditions();

// Create random times between given minutes and stops amount. 
function randomTimes(minutes, stops) {
    //let partsSize = Math.round(minutes / stops);
    //let randomNumber;
    //let min = partsSize / 2;
    //let totalTime = 0;
    for (let i = 0; i < stops; i++) {
        const randomNumber = Math.floor(Math.random() * (minutes - 1 + 1) + 1);
        //totalTime += Math.round(randomNumber);
        stopEvents.push(randomNumber);
    }

    stopEvents.sort((a, b) => a - b);

    for (let i = 0; i < stopEvents.length; i++) {
        stopEvents[i] = minutesToHourMinSec(stopEvents[i]);
    }
}

// Gives start values
function startConditions() {
    stopEvents = [];
    toggleRaceOn = false;
    timeSlider.value = 120;
    stopSlider.value = 4;
    timer = minutesToHourMinSec(timeSlider.value);
    let data = {
        "time": timer,
        "message": "INIT"
    }
    worker.postMessage(data);
    stringTime = timeInString(timer);
    stopsAmount = stopSlider.value;
    statusText.textContent = "Kesto ja BONUS kalan vaihtomäärä";
    displayStops.textContent = `${stopsAmount}`;
    displayTime.textContent = `${stringTime.hours}:${stringTime.minutes}`;
    runningClock.textContent = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
}

// Renders elements depending on if timer is on or off.
function renderElements() {
    stringTime = timeInString(timer);
    if (toggleRaceOn) {
        runningClock.style.display = "block";
        runningClock.textContent = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
        timeSlider.style.display = "none";
        stopSlider.style.display = "none";
        displayTime.style.visibility = "none";
        displayStops.style.display = "none";
    } else {
        runningClock.style.display = "none";
        stopList.style.display = "none";
        timeSlider.style.display = "block";
        stopSlider.style.display = "block";
        displayTime.style.display = "block";
        displayStops.style.display = "block";
    }
}

// Play button functionality. Hides elements that aren't needed when timer is on and starts timer. Prevents starting again if timer is allready running.
function startFishing() {
    if (stopEvents.length == 0) {
        randomTimes(timeSlider.value, stopSlider.value);
    }
    if (toggleRaceOn) {
        return;
    } 
    if (bonusFish !== undefined) {
        statusText.textContent = `Bonuskala ${bonusFish}`;
    } else {
        statusText.textContent = ``;
    }
    runningClock.style.display = "block";
    timeSlider.style.display = "none";
    stopSlider.style.display = "none";
    displayTime.style.display = "none";
    displayStops.style.display = "none";
    stopList.style.display = "none";
    toggleRaceOn = true;
    clearElementsChilds(stopList);
    makeList(stopEvents);

    let data = {
        "message": "START",
        "time": minutesToHourMinSec(timeSlider.value),
    }
    worker.postMessage(data);
}

// Reset button functionality. Reset values and displays sliders again to make new timer.
function resetFishing() {
    clearElementsChilds(stopList);
    bonusFish = undefined;
    toggleRaceOn = false;
    startConditions();
    worker.postMessage({ "message": "RESET" });
    renderElements();
    statusText.textContent = "Kesto ja BONUS kalan vaihtomäärä";
}

// Takes minutes in and converts it to hour, minutes and seconds
function minutesToHourMinSec(inputMinutes) {
    let hours = Math.floor(inputMinutes / 60);
    let minutes = inputMinutes % 60;
    let seconds = 0;
    let timer = {
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
    }
    return timer
}

// Takes integer values and convert time to string format for display purposis.
function timeInString(timer) {
    let stringMinutes, stringSeconds
    if (timer.minutes < 10) {
        stringMinutes = `0${timer.minutes}`;
    } else {
        stringMinutes = timer.minutes.toString();
    }
    if (timer.seconds < 10) {
        stringSeconds = `0${timer.seconds}`;
    } else {
        stringSeconds = timer.seconds.toString();
    }
    stringTime = {
        "hours": timer.hours.toString(),
        "minutes": stringMinutes,
        "seconds": stringSeconds
    }
    return stringTime;
}

// Check if timed event needs to be played. Change bonusfish and play sound.
function checkEventTimer(stops, timer) {
    let previousFish;
    for (let i = 0; i < stops.length; i++) {
        if (stops[i].hours == timer.hours && stops[i].minutes == timer.minutes && stops[i].seconds == timer.seconds) {
            previousFish = bonusFish;
            do {
                bonusFish = fishes.sample();
            } while (bonusFish === previousFish);
            console.log("TIMED EVENT");
            statusText.textContent = `Bonuskala ${bonusFish}`;
            window.navigator.vibrate(1000);
            bells.play();
        }
    }
}

function makeList(timeArray) {
    let stringTime = {};
    let div = document.createElement('div');
    div.textContent = `Bonuskalan vaihto:`;
    stopList.appendChild(div);
    for (let i = timeArray.length - 1; i >= 0; i--) {
        stringTime = timeInString(timeArray[i]);
        let li = document.createElement('li');
        li.setAttribute('class', 'listItems');
        li.textContent = `${stringTime.hours}:${stringTime.minutes}`;
        stopList.appendChild(li);
    }
}

function toggleShowList() {
    if (stopList.style.display == "block") {
        stopList.style.display = "none";
    } else {
        stopList.style.display = "block"
    }
}

function clearElementsChilds(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}