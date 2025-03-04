import { useState, useEffect } from 'react'
import word_dictionary from '../dictionary'
import Timer from './Timer';

export default function TypingSpeedTest() {
  const timer = 60
  const strokeDasharray = 283;  //for circle radius
  const dictionary = word_dictionary.join("").toString()
  const [time, setTime] = useState(timer)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [currentInput, setCurrentInput] = useState('')
  const [currentWord, setCurrentWord] = useState(word_dictionary.join("").toString())
  const [wordList, setWordList] =  useState(word_dictionary)
  const [isActive, setIsActive] = useState(false)
  const [correctWords, setCorrectWords] = useState(0)
  const [crossedOutWords, setCrossedOutWords] = useState([])

  useEffect(() => {
    let interval
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      setIsActive(false)
      setCurrentWord(dictionary)
      console.log('reset-everything-show-results-as-popup')
    }
    return () => {
      clearInterval(interval);
    }
  }, [isActive, time])


  const handleStartTyping = () => {
    if(!isActive){
      setWordCount(0)
      setCurrentWord(wordList[0])
    }
  }; 
 

  const handleInputChange = (e) => {
    if(!isActive){
      startTest()
    }
    const value = e.target.value
    setCurrentInput(value)
    if(value.trim() == ''){
      return;
    }

     // Check if a word is completed
     if (value.endsWith(' ')) {
      setWordCount((prevCount) => prevCount + 1);
      setCharCount((prevCount) => prevCount + value.trim().length);
      
      // Check if the completed word is correct
      const isCorrect = value.trim() === currentWord;
      if (isCorrect) {
          setCorrectWords((prevCorrect) => prevCorrect + 1);
      } else {
          // Add the incorrect word to the crossed out list
          setCrossedOutWords((prev) => [...prev, currentWord]);
      }

      // Calculate accuracy
      setAccuracy(Math.round(((correctWords + (isCorrect ? 1 : 0)) / (wordCount + 1)) * 100));
      
      setCurrentInput('');
      
      // Move to the next word in the list
      const wordIndex = wordList.indexOf(currentWord);
      if (wordIndex < wordList.length - 1) {
          setCurrentWord(wordList[wordIndex + 1]);
      }
    }

  }

  const startTest = () => {
    setIsActive(true)
    setTime(timer)
    setCharCount(0)
    setAccuracy(100)
    setCurrentInput('')
    setCrossedOutWords([])
  }

  return (
    <>
   
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 relative">
        {/* <div className="absolute top-4 left-4">
          <div className="w-12 h-12 bg-gray-900 rounded-full"></div>
        </div> */}
        
        <h2 className="text-center text-gray-500 mb-2">TYPING SPEED TEST</h2>
        <h1 className="text-4xl font-bold text-center mb-8">Test your typing skills</h1>
        
        <div className="flex justify-center space-x-8 mb-8">
        
          <div className="flex flex-col items-center">
          <Timer startAnimation={isActive} initialTime={timer}/>
            {/* <div className="w-24 h-24 rounded-full border-4 border-yellow-400 flex items-center justify-center"  >
              <span className="text-2xl font-bold">{time}</span>
            </div> */}
            <span className="mt-2 text-sm text-gray-500">seconds</span> 
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl border-4 border-gray-100 flex items-center justify-center">
              <span className="text-2xl font-bold">{wordCount}</span>
            </div>
            <span className="mt-2 text-sm text-gray-500">words/min</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl border-4 border-gray-100 flex items-center justify-center">
              <span className="text-2xl font-bold">{charCount}</span>
            </div>
            <span className="mt-2 text-sm text-gray-500">chars/min</span>
          </div>
          {/* <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-gray-100 flex items-center justify-center">
              <span className="text-2xl font-bold">{accuracy}</span>
            </div>
            <span className="mt-2 text-sm text-gray-500">% accuracy</span>
          </div> */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Background border circle in gray */}
                <svg className="absolute top-0 left-0 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="lightgray"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>

                {/* Dynamic green border circle */}
                <svg className="absolute top-0 left-0 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="green"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDasharray * (1 - accuracy / 100)}
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                  />
                </svg>

                <span className="text-2xl font-bold">{accuracy}</span>

                {/* <button
                  onClick={() => updateAccuracy(Math.min(accuracy + 10, 100))}
                  className="absolute bottom-0 text-xs mt-2 px-1 py-1 text-white bg-blue-500 rounded"
                >
                  Increase
                </button> */}
            </div>
            <span className="mt-2 text-sm text-gray-500">% accuracy</span>
          </div>
            
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4 overflow-hidden whitespace-nowrap flex justify-center items-center">
          <p className="text-lg space-x-1  transition-transform duration-200" 
          style={{
            transform: `translateX(${-(wordList.indexOf(currentWord) - Math.floor(wordList.length / 1.55)) * 50}px)`,
            display: 'flex',
            justifyContent: 'center',
            width: '100%', // Ensures the p element takes full width
          }}
          >
          {wordList.map((word, index) => {
            // Check if the word is before, at, or after the current word
            const isCompleted = index < wordList.indexOf(currentWord);
            const isCurrent = index === wordList.indexOf(currentWord);
            const isCrossedOut = crossedOutWords.includes(word);
            
            return (
                  <span
                    key={index}
                    className={`${isCrossedOut ? "line-through text-red-500" : isCompleted ? "text-gray-400" : isCurrent ? "text-black" : "text-black font-semibold"}`}
                  >
                    {isCurrent ? (
                      <>
                        {currentInput !== '' ? <span className="text-gray-400">
                          {word.split('').map((char, charIndex) => {
                            // {console.log(char, charIndex, currentInput, "??",currentInput[charIndex], "...", word)}
                            // Color correct characters gray, incorrect ones remain black
                            return (
                              <span key={charIndex} className={charIndex < currentInput.length && char === currentInput[charIndex] ? "text-gray-400" : "text-black"}>
                                {char}
                              </span>
                            );
                          })}
                      </span> : 
                        <>
                          <span className="text-gray-400">{word.slice(0, currentInput.length)}</span>
                          <span>{word.slice(currentInput.length)}</span>
                        </>
                      }
                      </>
                    ) : (
                      word
                    )}
                  </span>
                );
              })}
          </p>
        </div>
        
        <input
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onClick={handleStartTyping} 
          className="w-full p-2 border rounded"
          placeholder="Start typing..."
        />
        
      </div>
    </div>
    </>
  )
}