/*
    
    Description:
    Fish timer! User can give time and stops for changing "bonus" fish for fishing competitions

    Functionality:
    Two sliders for timer and stops amount
    Stops are randomly placed between given time interval
    Stop event will play sound and display new bonus fish
*/

// Get reference to elements
const timeSlider = document.querySelector("#time");
const stopSlider = document.querySelector("#stops");
const displayTime = document.querySelector("#clock-display");
const displayStops = document.querySelector("#stops-display");
const playButton = document.querySelector("#play");
const pauseButton = document.querySelector("#pause");
const resetButton = document.querySelector("#reset");
const runningClock = document.querySelector("#time-left");
const statusEl = document.querySelector("#status");

let timerInMinutes, stopsAmount, toggleRaceOn, timer, paused, storeTimer, stringTime
const fishes = ["Hauki", "Ahven", "Kuha", "Taimen"];

startConditions();

function startConditions() {
    paused = true;
    toggleRaceOn = false;
    timeSlider.value = 120;
    stopSlider.value = 4;
    timer = setupClock(timeSlider.value);
    stringTime = timeInString(timer);
    stopsAmount = stopSlider.value;
    statusEl.innerHTML = "Määritä kisan kesto ja BONUS kalan vaihtomäärä";
    displayStops.innerHTML = stopsAmount;
    displayTime.innerHTML = `${stringTime.hours}:${stringTime.minutes}`;
    runningClock.innerHTML = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
}

timeSlider.oninput = function () {
    timerInMinutes = this.value;
    timer = setupClock(timeSlider.value);
    stringTime = timeInString(timer);
    displayTime.innerHTML = `${stringTime.hours}:${stringTime.minutes}`;
    runningClock.innerHTML = `${stringTime.hours}:${stringTime.minutes}:${stringTime.seconds}`;
}

stopSlider.oninput = function () {
    stopsAmount = this.value;
    displayStops.innerHTML = this.value;
}

playButton.addEventListener("click", startFishing);
pauseButton.addEventListener("click", pauseFishing);
resetButton.addEventListener("click", resetFishing);


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


function startFishing() {
    statusEl.innerHTML = "Kisa käynnissä";
    runningClock.style.display = "block";
    timeSlider.style.display = "none";
    stopSlider.style.display = "none";
    displayTime.style.display = "none";
    displayStops.style.display = "none";
    paused = false;
    toggleRaceOn = true;
    runClock(timer)
}

function pauseFishing() {
    if(!toggleRaceOn) {
        return;
    }

    statusEl.innerHTML = "Kisa pysäytetty";

    clearTimeout(storeTimer);
    paused = !paused
    if(!paused) {
        startFishing();
    }
}

function resetFishing() {
    clearTimeout(storeTimer);
    paused = true;
    toggleRaceOn = false;
    startConditions();
    renderElements();
    statusEl.innerHTML = "Määritä kisan kesto ja BONUS kalan vaihtomäärä";
}


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
            renderElements();
            runClock(timer);
        }, 1000)
    }
}
