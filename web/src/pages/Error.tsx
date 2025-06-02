import { useEffect } from "react";
import Button from "../components/Button";
import CardBox from "../components/CardBox/CardBox";
import SectionFullScreen from "../components/Section/FullScreen";
import { getPageTitle } from "../config";

const Error = () => {
  useEffect(() => {
    document.title = getPageTitle("Error");
  }, []);

  return (
    <SectionFullScreen>
      <CardBox
        className="w-11/12 shadow-2xl md:w-7/12 lg:w-6/12 xl:w-4/12"
        footer={<Button href="/dashboard" label="Done" />}
      >
        <div className="space-y-3">
          <h1 className="text-2xl">Unhandled exception</h1>
          <p>An error occurred</p>
        </div>
      </CardBox>
    </SectionFullScreen>
  );
};

export default Error;
