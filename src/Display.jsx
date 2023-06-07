import React, { useRef } from 'react'
import { getCaretPosition } from './Buttons';
export var displayRef = React.createRef()
export var positionRef = React.createRef()


export default function Display() {
  displayRef = useRef(null)
  positionRef = useRef(0)
  return (
    <div className="display"
      contentEditable="true" ref={displayRef} onClick={() => positionRef.current = getCaretPosition(displayRef.current)} inputMode="none" >
    </div>
  )
}