import { useState, useEffect, useRef } from "react";
import { Input, InputOtp } from "@nextui-org/react";

export function InputOPTTest(){
  const inputRef = useRef(null);
  const [payPin, setPayPin] = useState("");

  const focusInput = async(index) => {
    for(let i = 0; i <= index; i++) {
      // await new Promise(resolve => setTimeout(resolve, 100));
      setTimeout(dispatchArrowLeft, 10)
      console.log('ArrowLeft call',i, index);
    }
  };

  const dispatchArrowLeft = () => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        keyCode: 37,
        bubbles: true
      });
      inputRef.current?.focus();
      inputRef.current?.dispatchEvent(event);
      // window.dispatchEvent(event);
      console.log('ArrowLeft run', inputRef.current?.dispatchEvent);
  };

  // useEffect(()=>{
  //   let items = document.querySelectorAll('.segment-item');
  //   console.log('segments', inputRef, items);
  //   setSegments(items);
  // }, [inputRef]);

  return (<div>
    <InputOtp
      length={6}
        ref={inputRef}
        value={payPin}
        type={"text"}
        size="lg"
        classNames={{
          segment: [
            "mx-1 border-1 data-[active=true]:border-primary data-[focus=true]:outline-transparent segment-item bg-[#ccc]",
          ],
          segmentWrapper: "gap-x-0 segmentWrapper bg-[red]",
        }}
        errorMessage=" "
        variant="bordered"
        onValueChange={setPayPin}
        onMouseDown={ (e)=>{
          e.target?.focus();
        }}
        onClick={(e) => {
          console.log('onClick 2', payPin,  e)
        }}
      />

      <button onClick={() => focusInput(2)}>
        Focus 3rd segment
      </button>
      <hr />
      <button onClick={() => focusInput(1)}>
              Focus 2rd segment
            </button>
  </div>);
}
