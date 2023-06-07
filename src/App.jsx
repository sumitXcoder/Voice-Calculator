import React, { useState, useRef } from 'react'
import Buttons from './Buttons'
import Display, { displayRef } from './Display'
import { values, sciValues, speechFilters } from './Values'

export default function App() {
  const [currentButtons, setCurrentButtons] = useState(values)
  const [mic, setMic] = useState(false)
  const textRef = useRef("")
  const recognition = useRef(null)

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
        // var transcript=""
        const text = displayRef.current.textContent
        recognition.current.onresult = function (event) {
          var interimTranscripts = '';
          if (navigator.userAgent.includes("Chrome")) {
            for (var i = event.resultIndex; i < event.results.length; i++) {
              var transcript = event.results[i][0].transcript.toLowerCase();
              transcript = filterSpeech(transcript)
              if (event.results[i].isFinal) {
                textRef.current += transcript;
              } else {
                interimTranscripts += transcript;
              }
            }
          }
          else {
            for (i = event.resultIndex; i < event.results.length; i++) {
              transcript = event.results[i][0].transcript.toLowerCase();
              transcript = filterSpeech(transcript)
              if (event.results[i][0].confidence > 0) {
                textRef.current += transcript;
              } else {
                interimTranscripts += transcript;
              }
            }
          }
          displayRef.current.textContent = text + textRef.current + interimTranscripts
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

