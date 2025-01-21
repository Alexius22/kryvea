import React, { useRef, useState } from "react";
import { mdiChevronDown } from "@mdi/js";
import Icon from "../Icon";
import "./Accordion.css";

//  accordionitem component
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  const contentHeight = useRef<HTMLDivElement>();
  return (
    <div className="wrapper">
      <button className={`question-container ${isOpen ? "active" : ""}`} onClick={onClick}>
        <p className="question-content">{question}</p>
        <Icon className={`arrow ${isOpen ? "active" : ""}`} path={mdiChevronDown} w="w-16" size="18" />
      </button>

      <div
        ref={contentHeight}
        className="answer-container"
        style={isOpen ? { height: contentHeight.current.scrollHeight } : { height: "0px" }}
      >
        <p className="answer-content">{answer}</p>
      </div>
    </div>
  );
};

const Accordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [yes, setYes] = useState(false);

  const handleItemClick = index => {
    setActiveIndex(prevIndex => (prevIndex === index ? null : index));
  };
  const index = "accordion1";

  return (
    <div className="container">
      <AccordionItem
        key={index}
        question={"are you a developer?"}
        answer={"yes, I am a developer"}
        isOpen={yes}
        onClick={() => setYes(prev => !prev)}
      />
    </div>
  );
};

export default Accordion;
