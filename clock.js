self.onmessage = function(e)
{
   if (e.data.message === "INIT")
   {
      /* When you receive "INIT" message, initialize timerWorker */
      timer = e.data.time;
      isRunning = false;
   }
   else if (e.data.message === "START")
   {
      /* When you receive "START" message, toggle state of isRunning and set or clear interval event */
      if (isRunning)
      {
         return;
      }
      else
      {
         self.postMessage("START");
         timer = e.data.time;
         isRunning = true;
         intervalHandler = setInterval(timerOn, 1000);
      }
   }
   else if (e.data.message === "RESET")
   {

      /* When you receive "RESET" message, change isRunning to false and clear interval event */
      clearInterval(intervalHandler);
      isRunning = false;
      self.postMessage("RESET");
   }
};

function timerOn()
{
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

  let data = {
     "message": "UPDATE",
     "time": timer
  }
   self.postMessage(data);

   if (timer.hours == 0 && timer.minutes == 0 && timer.seconds == 1)
   {
      self.postMessage("END");
      clearInterval(intervalHandler);
      isRunning = false;
   }
}
