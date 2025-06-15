import { useEffect } from "react";
import Card from "../components/CardBox/Card";
import Button from "../components/Form/Button";
import SectionFullScreen from "../components/Section/SectionFullScreen";
import { getPageTitle } from "../config";

export default function Error() {
  useEffect(() => {
    document.title = getPageTitle("Error");
  }, []);

  return (
    <SectionFullScreen>
      <Card
        className="w-11/12 shadow-2xl md:w-7/12 lg:w-6/12 xl:w-4/12"
        footer={<Button text="Done" onClick={() => {}} />}
      >
        <div className="space-y-3">
          <h1 className="text-2xl">Unhandled exception</h1>
          <p>An error occurred</p>
        </div>
      </Card>
    </SectionFullScreen>
  );
}
