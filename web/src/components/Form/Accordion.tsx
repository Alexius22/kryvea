import { useContext, useRef, useState } from "react";
import { GlobalContext } from "../../App";
import Icon from "../Icon";

//  accordionitem component
function AccordionItem({ title, isOpen, onClick, children }) {
  const contentHeight = useRef<HTMLDivElement>();
  const dropDownArrow =
    "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z";
  return (
    <div className="wrapper">
      <button className={`question-container ${isOpen ? "active" : ""}`} onClick={onClick}>
        <p className="question-content">{title}</p>
        <Icon className={`arrow ${isOpen ? "active" : ""}`} path={dropDownArrow} size="20" viewBox={"0 0 20 20"} />
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
}

export default function Accordion({ title, children }) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = index => {
    setActiveIndex(prevIndex => (prevIndex === index ? null : index));
  };
  const index = "accordion";

  return (
    <div className="Accordion-container">
      <AccordionItem key={index} title={title} isOpen={isOpen} onClick={() => setIsOpen(prev => !prev)}>
        {children}
      </AccordionItem>
    </div>
  );
}
