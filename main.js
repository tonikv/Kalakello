/*
    Description:
    Fish timer! User can give length of fish competition and stops for changing "bonus" fish. 
    It then displays how much is left of competition and bonus fish. Bonus fish is randomly changed.

    Functionality:
    Two sliders for timer and stops amount
    Stops are randomly placed between given time interval
    Stop event will play sound and display new bonus fish
*/

Array.prototype.sample = function() {
    return this[Math.floor(Math.random()*this.length)];
}

// Get reference to elements
const timeSlider = document.querySelector("#time");
const stopSlider = document.querySelector("#stops");
const displayTime = document.querySelector("#clock-display");

const displayStops = document.querySelector("#stops-display");
const playButton = document.querySelector("#play");
const pauseButton = document.querySelector("#pause");
const resetButton = document.querySelector("#reset");
const runningClock = document.querySelector("#time-left");
const statusText = document.querySelector("#status");

// Event listeners
playButton.addEventListener("click", startFishing);
pauseButton.addEventListener("click", pauseFishing);
resetButton.addEventListener("click", resetFishing);

timeSlider.oninput = function () {
    timer = setupClock(this.value);
    stringTime = timeInString(timer);
    displayTime.innerHTML = `${stringTime.hours}:${stringTime.minutes}`;
    runningClock.innerHTML = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
}

stopSlider.oninput = function () {
    stopsAmount = this.value;
    displayStops.innerHTML = this.value;
}

// Variables
const bells = new Audio(`mixkit-school-calling-bell-580.wav`);
const fishes = ["Hauki", "Ahven", "Taimen", "Kuha"];
let bonusFish = fishes.sample();
let stopsAmount, toggleRaceOn, timer, paused, storeTimer, stringTime
let stopEvents = [];

// Initial state for program.
startConditions();

// Create random times between given minutes and stops amount. 
function randomTimes(minutes, stops) {
    let partsSize = Math.round(minutes / stops);
    let randomNumber;
    let min = partsSize / 2;
    let totalTime = 0;
    for(let i=0; i < stops; i++) {
        randomNumber = Math.floor(Math.random() * min) + min;
        totalTime += Math.round(randomNumber);
        stopEvents.push(totalTime);
    }

    for(let i=0; i < stopEvents.length; i++) {
        stopEvents[i] = setupClock(stopEvents[i]);
    }
}

// Gives start values
function startConditions() {
    stopEvents = [];
    paused = true;
    toggleRaceOn = false;
    timeSlider.value = 120;
    stopSlider.value = 4;
    timer = setupClock(timeSlider.value);
    stringTime = timeInString(timer);
    stopsAmount = stopSlider.value;
    statusText.innerHTML = "Määritä kisan kesto ja BONUS kalan vaihtomäärä";
    displayStops.innerHTML = stopsAmount;
    displayTime.innerHTML = `${stringTime.hours}:${stringTime.minutes}`;
    runningClock.innerHTML = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
}

// Renders elements depending on if timer is on or off.
function renderElements() {
    stringTime = timeInString(timer);
    if (toggleRaceOn) {
        runningClock.style.display = "block";
        runningClock.innerHTML = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
        timeSlider.style.display = "none";
        stopSlider.style.display = "none";
        displayTime.style.display = "none";
        displayStops.style.display = "none";
    } else {
        runningClock.style.display = "none";
        timeSlider.style.display = "block";
        stopSlider.style.display = "block";
        displayTime.style.display = "block";
        displayStops.style.display = "block";
    }
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

// Play button functionality. Hides elements that aren't needed when timer is on and starts timer. Prevents starting again if timer is allready running.
function startFishing() {
    if (stopEvents.length == 0) {
        randomTimes(timeSlider.value, stopSlider.value);
    }
    if(toggleRaceOn) {
        return;
    }
    statusText.innerHTML = `Bonuskala ${bonusFish}`;
    runningClock.style.display = "block";
    timeSlider.style.display = "none";
    stopSlider.style.display = "none";
    displayTime.style.display = "none";
    displayStops.style.display = "none";
    paused = false;
    toggleRaceOn = true;
    runClock(timer)
}

// Pause button functionality. Pauses timer and displays status text accordingly. Toggling will restart timer.
function pauseFishing() {
    bells.pause();
    if (!toggleRaceOn && !paused) {
        return;
    }
    toggleRaceOn = false;
    statusText.innerHTML = "Kisa pysäytetty";

    clearTimeout(storeTimer);
    paused = !paused
    if (!paused) {
        startFishing();
    }
}

// Reset button functionality. Reset values and displays sliders again to make new timer.
function resetFishing() {
    clearTimeout(storeTimer);
    paused = true;
    toggleRaceOn = false;
    startConditions();
    renderElements();
    statusText.innerHTML = "Määritä kisan kesto ja BONUS kalan vaihtomäärä";
}

// Takes minutes in and converts it to hour, minutes and seconds
function setupClock(inputMinutes) {
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

// Check if timed event needs to be played. Change bonusfish and play sound.
function checkEventTimer(stops, timer) {
    for(let i=0; i < stops.length; i++) {
        if (stops[i].hours == timer.hours && stops[i].minutes == timer.minutes && stops[i].seconds == timer.seconds) {
            
            bonusFish = fishes.sample();
            statusText.innerHTML = `Bonuskala ${bonusFish}`;
            bells.play();

        }
    }
}

// Run clock down until time is out. 
function runClock(timer) {
    if (!paused) {
        storeTimer = setTimeout(function () {
            if (timer.seconds - 1 === -1) {
                timer.seconds = 59;
                timer.minutes = timer.minutes - 1;
            } else {
                timer.seconds = timer.seconds - 1;
            }

            if (timer.minutes == -1) {
                timer.minutes = 59;
                timer.hours = timer.hours - 1;
            }

            if (timer.hours == 0 && timer.minutes == 0 && timer.seconds == 1) {
                console.log("TIME OUT!");
            }

            checkEventTimer(stopEvents, timer);
            renderElements();
            runClock(timer);
        }, 1000)
    }
}