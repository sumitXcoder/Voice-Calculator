import React, { useState, useRef, useEffect } from 'react'
import Buttons from './Buttons'
import Display, { displayRef } from './Display'
import { values, sciValues, speechFilters } from './Values'
export default function App() {
  const [currentButtons, setCurrentButtons] = useState(values)
  const [mic, setMic] = useState(false)
  const textRef = useRef("")
  const recognition = useRef(null)
  const isTouchScreen = useRef(null)
  useEffect(() => {
    isTouchScreen.current = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
  }, [])

  function changeValues() {
    currentButtons === values ? setCurrentButtons(sciValues) : setCurrentButtons(values)
  }

  function filterSpeech(exp) {
    for (let value in speechFilters) {
      exp = exp.replaceAll(value, speechFilters[value])
    }
    return exp
  }

  function voiceToText() {
    if (!mic) {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition.current = new SpeechRecognition()
        recognition.current.continuous = true
        recognition.current.interimResults = isTouchScreen.current ? true : false
        recognition.current.lang = "en-IN"
        recognition.current.start()
        recognition.current.onstart = () => {
          setMic(prev => !prev)
        }
        recognition.current.onresult = function (event) {
          if (isTouchScreen.current) {
            for (var i = 0; i < event.results.length; i++) {
              var transcript = event.results[i][0].transcript.toLowerCase();
              transcript = filterSpeech(transcript)
              if(event.results[i].isFinal)
              textRef.current += transcript;
            }
            displayRef.current.textContent = textRef.current
          }
          else {
            var interimTranscripts = '';
            for (i = event.resultIndex; i < event.results.length; i++) {
              transcript = event.results[i][0].transcript.toLowerCase();
              transcript = filterSpeech(transcript)
              if (event.results[i].isFinal) {
                textRef.current += transcript;
              } else {
                interimTranscripts += transcript;
              }
            }
            displayRef.current.textContent = textRef.current + interimTranscripts
          }
        }
      }
      else {
        window.alert("Your browser doesnot support speech recognition :(")
      }
    }
    else {
      setMic(prev => !prev)

      recognition.current.stop()
    }
  }

  return (
    <div className="calculator">
      <button className="sci" onClick={changeValues}>√ π e =</button>
      <button className={mic ? "mic-on" : "mic-off"} onClick={voiceToText}></button>
      <Display />
      <Buttons buttons={currentButtons} mic={mic} textRef={textRef} />
    </div>
  )
}

