import { mdiChevronDown } from "@mdi/js";
import { useContext, useRef, useState } from "react";
import { GlobalContext } from "../../../App";
import Icon from "../Icon/Icon";
import "./Accordion.css";

//  accordionitem component
const AccordionItem = ({ title, isOpen, onClick, children }) => {
  const contentHeight = useRef<HTMLDivElement>();
  return (
    <div className="wrapper">
      <button className={`question-container ${isOpen ? "active" : ""}`} onClick={onClick}>
        <p className="question-content">{title}</p>
        <Icon className={`arrow ${isOpen ? "active" : ""}`} path={mdiChevronDown} w="w-16" size="18" />
      </button>

      <div
        ref={contentHeight}
        className="answer-container"
        style={isOpen ? { height: contentHeight.current.scrollHeight } : { height: "0px" }}
      >
        {children}
      </div>
    </div>
  );
};

const Accordion = ({ title, children }) => {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = index => {
    setActiveIndex(prevIndex => (prevIndex === index ? null : index));
  };
  const index = "accordion1";

  return (
    <div className="Accordion-container" style={{ backgroundColor: darkTheme ? "#1E293B" : "#FFFFFF" }}>
      <AccordionItem key={index} title={title} isOpen={isOpen} onClick={() => setIsOpen(prev => !prev)}>
        {children}
      </AccordionItem>
    </div>
  );
};

export default Accordion;
