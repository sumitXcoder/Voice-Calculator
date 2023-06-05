import React, { useState, useEffect, useRef } from 'react'
import { displayRef, positionRef } from './Display'
import { evaluate } from "mathjs"
import { values, sciValues, invValues, degrees, radians, requireParenthesis } from './Values'

export function getCaretPosition(editableDiv) {
    var caretPos = 0, sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode === editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() === editableDiv) {
            var tempEl = document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return caretPos;
}

function setCaretPosition(position) {
    var range = document.createRange()
    var sel = window.getSelection()
    range.setStart(displayRef.current.childNodes[0], position)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
}

function Button({ className, text, handleClick }) {
    return (
        <button className={className} onClick={e => handleClick(e)}>{text}</button>
    )
}

function Mathify(exp, unit) {
    if (unit === "deg")
        for (let value in degrees)
            exp = exp.replaceAll(value, degrees[value])
    else
        for (let value in radians)
            exp = exp.replaceAll(value, radians[value])
    return exp

}

function containsFactorial(exp) {
    while (exp.includes("!")) {
        let count = 1, i
        i = exp.indexOf("!") - 2
        exp = exp.replace("!", "")
        while (count !== 0 && i >= 0) {
            if (exp[i] === ")")
                count += 1
            else if (exp[i] === "(")
                count -= 1
            i--
        }
        exp = exp.slice(0, i + 1) + "factorial" + exp.slice(i + 1)
    }
    return exp
}

export default function Buttons({ buttons, mic, textRef }) {

    var i = 0
    const [unit, setUnit] = useState("deg")
    const buttonsRef = useRef(null)
    const [myButtons, setMyButtons] = useState(buttons)
    const [exp, setExp] = useState(null)
    const expression = displayRef.current

    useEffect(() => {
        const btn1 = buttonsRef.current.children[4]
        const btn2 = buttonsRef.current.children[3]
        const btn3 = buttonsRef.current.children[9]
        if (buttons !== values) {
            btn1.style.color = unit === "deg" ? "blue" : "black"
            btn2.style.color = unit === "rad" ? "blue" : "black"
            btn3.style.color = buttons === invValues ? "red" : "black"
        }
        else {  
            for(let btn of [btn1,btn2,btn3]) {
                btn.style.color="black"
            }
        }
        setMyButtons(buttons)
        setExp(0)
    }, [buttons, unit, exp])

    function handleClick(e) {
        let value = e.target.textContent
        try {
            switch (value) {
                case "C":
                    expression.textContent = ""
                    positionRef.current = 0
                    if (mic)
                        textRef.current = ""
                    break

                case "rad":
                    setUnit("rad")
                    break

                case "deg":
                    setUnit("deg")
                    break

                case "=":
                    expression.textContent = containsFactorial(expression.textContent)
                    const result = evaluate(Mathify(expression.textContent, unit))
                    result % 1 !== 0 ? expression.textContent = result.toPrecision(3) : expression.textContent = result
                    positionRef.current = expression.textContent.length
                    setCaretPosition(positionRef.current)
                    if (mic)
                        textRef.current = expression.textContent
                    break

                case "⊗":
                    let string = ""
                    for (let i = 0; i < expression.textContent.length; i++) {
                        const char = expression.textContent[i]
                        if (i === positionRef.current - 1)
                            continue
                        else
                            string += char
                    }
                    expression.textContent = string
                    positionRef.current -= 2
                    if (mic)
                        textRef.current = string
                    break

                case "inv":
                    const btn3 = buttonsRef.current.children[9]
                    if (myButtons === sciValues) {
                        btn3.style.color = "red"
                        setMyButtons(invValues)
                    }
                    else {
                        btn3.style.color = "black"
                        setMyButtons(sciValues)
                    }
                    break

                default:
                    if (value === "eˣ")
                        value = "e^"
                    else if (value === "x²")
                        value = "^2"
                    else if (value === "!")
                        value = "()!"
                    if (requireParenthesis.includes(value)) {
                        value += "("
                    }
                    if (expression.textContent !== "") {
                        expression.textContent = expression.textContent.slice(0, positionRef.current) + value + expression.textContent.slice(positionRef.current)
                    }
                    else {
                        expression.textContent += value
                    }
                    setCaretPosition(positionRef.current + value.length)
                    if (mic)
                        textRef.current = expression.textContent
                    break
            }
            if (positionRef.current < expression.textContent.length)
                positionRef.current += value.length
            if (value !== "C")
                setCaretPosition(positionRef.current)
        } catch (e) {
            if (e instanceof SyntaxError) {
                expression.textContent = "ERROR!"
                setTimeout(() => expression.textContent = "", 1000)
            }
        }
    }

    return (

        <div ref={buttonsRef} className="buttons" style={{ gridTemplateColumns: myButtons === values ? "repeat(4,1fr)" : "repeat(5,1fr)" }}>
            {
                myButtons.map(value => {

                    if (value === "⊗")
                        return <Button key={i++} className={"btn remove"} text={value} handleClick={handleClick} />
                    else if (value === "C")
                        return <Button key={i++} className={"btn clear"} text={value} handleClick={handleClick} />
                    else if (value === "=")
                        return <Button key={i++} className={"btn equal"} text={value} handleClick={handleClick} />
                    else
                        return <Button key={i++} className={"btn"} text={value} handleClick={handleClick} />
                })
            }
        </div>
    )
}
