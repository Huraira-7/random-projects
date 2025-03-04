import React, { useEffect, useRef, useState } from 'react';
import './Timer.css';

const Timer = ({ initialTime = 60, startAnimation = false }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);

  const runTimer = () => {
    // console.log("start timer")

    const timerElement = timerRef.current;
    const timerCircle = timerElement.querySelector('svg > circle + circle');
    timerElement.classList.add('animatable');
    timerCircle.style.strokeDashoffset = 1;

    const countdownTimer = setInterval(() => {
      if (timeLeft > -1) {
          setTimeLeft((prevTime) => {
            // console.log('time left',prevTime)
            if (prevTime > 0) {
                const newTime = prevTime - 1;
                const normalizedTime = (initialTime - newTime) / initialTime;
                timerCircle.style.strokeDashoffset = normalizedTime;
                return newTime;
            } else {
                // console.log('end timer');
                clearInterval(countdownTimer);
                timerElement.classList.remove('animatable');
                timerCircle.style.strokeDashoffset = '';
                return prevTime;
            }
        });
      } else {
        // console.log('STOP timer');
        clearInterval(countdownTimer);
        timerElement.classList.remove('animatable');
        timerCircle.style.strokeDashoffset = '';
      }
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(countdownTimer);
  };

  useEffect(() => {
    if (startAnimation) {
      setTimeLeft(initialTime); // Reset the timer when starting
      runTimer();
    } 
  }, [startAnimation, initialTime]); // Run when `startAnimation` or `initialTime` changes

  return (
    <div className='flex flex-col items-center justify-center w-24 h-24 '>
      <div className="relative timer animatable w-24 h-24 rounded-full flex items-center justify-center" ref={timerRef}>
        <svg className='absolute inset-0 w-full h-full'>
          <circle cx="50%" cy="50%" r="46" />
          <circle cx="50%" cy="50%" r="46" pathLength="1" />
        </svg>
        <span id="timeLeft" className="text-2xl font-bold absolute inset-0 flex items-center justify-center"> {Math.max(0,timeLeft)} </span>
      </div>
    </div>
  );
};

export default Timer;
