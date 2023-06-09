import React, { useState, useRef, useEffect } from 'react'
import Buttons from './Buttons'
import Display, { displayRef } from './Display'
import { values, sciValues, speechFilters } from './Values'

export default function App() {

  const [currentButtons, setCurrentButtons] = useState(values)
  const [mic, setMic] = useState(false)
  const textRef = useRef("")
  const recognition = useRef(null)
  const chrome = useRef(null)
  const isTouchScreen = useRef(null)

  useEffect(() => {
    chrome.current = navigator.userAgent.includes("Chrome")
    isTouchScreen.current = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints
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
        recognition.current.interimResults = true
        recognition.current.lang = "en-IN"
        recognition.current.start()
        recognition.current.onstart = () => {
          setMic(prev => !prev)
        }
        recognition.current.onend = () => {
          setMic(prev => !prev)
        }
        recognition.current.onresult = function (event) {
          var interimTranscripts = '';
          var confidence = 0
          if (chrome.current && !isTouchScreen.current) {
            for (var i = event.resultIndex; i < event.results.length; i++) {
              var transcript = event.results[i][0].transcript.toLowerCase();
              transcript = filterSpeech(transcript)
              confidence = 0
              if (event.results[i].isFinal) {
                textRef.current += transcript;
                confidence = 1
              } else {
                interimTranscripts += transcript;
              }
            }
            if (!confidence)
              displayRef.current.textContent = textRef.current + interimTranscripts
            confidence = 0
          }
          else {
            for (i = event.resultIndex; i < event.results.length; i++) {
              transcript = event.results[i][0].transcript.toLowerCase();
              transcript = filterSpeech(transcript)
              confidence = event.results[i][0].confidence
              if (confidence > 0) {
                textRef.current += transcript;
              } else {
                interimTranscripts += transcript;
              }
            }
            if (isTouchScreen.current || !confidence)
              displayRef.current.textContent = textRef.current + interimTranscripts
          }
        }
      }
      else {
        window.alert("Your browser doesnot support speech recognition :(")
      }
    }
    else {
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

