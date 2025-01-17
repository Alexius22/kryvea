import { useEffect, type ReactElement } from "react";
import Button from "../components/Button";
import CardBox from "../components/CardBox";
import SectionFullScreen from "../components/Section/FullScreen";
import LayoutGuest from "../layouts/Guest";
import { getPageTitle } from "../config";

const Error = () => {
  useEffect(() => {
    document.title = getPageTitle("Error");
  }, []);

  return (
    <>
      <SectionFullScreen bg="pinkRed">
        <CardBox
          className="w-11/12 shadow-2xl md:w-7/12 lg:w-6/12 xl:w-4/12"
          footer={<Button href="/dashboard" label="Done" color="danger" />}
        >
          <div className="space-y-3">
            <h1 className="text-2xl">Unhandled exception</h1>

            <p>An Error Occurred</p>
          </div>
        </CardBox>
      </SectionFullScreen>
    </>
  );
};

Error.getLayout = function getLayout(page: ReactElement) {
  return <LayoutGuest>{page}</LayoutGuest>;
};

export default Error;
