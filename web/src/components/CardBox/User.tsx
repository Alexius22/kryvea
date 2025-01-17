import { mdiCheckDecagram } from "@mdi/js";
import { Formik } from "formik";
import { useContext } from "react";
import CardBox from ".";
import { GlobalContext } from "../../../App";
import PillTag from "../PillTag";

type Props = {
  className?: string;
};

const CardBoxUser = ({ className }: Props) => {
  const {
    useUsername: [username],
  } = useContext(GlobalContext);

  return (
    <CardBox className={className}>
      <div className="flex flex-col items-center justify-around lg:flex-row lg:justify-center">
        <div className="space-y-3 text-center md:text-left lg:mx-12">
          <div className="flex justify-center md:block">
            <Formik
              initialValues={{
                notifications: ["1"],
              }}
              onSubmit={values => alert(JSON.stringify(values, null, 2))}
            ></Formik>
          </div>
          <h1 className="text-2xl">
            Hi, <b>{username}</b>!
          </h1>
          <p>
            Last login <b>12 mins ago</b> from <b>127.0.0.1</b>
          </p>
          <div className="flex justify-center md:block">
            <PillTag label="Verified" color="info" icon={mdiCheckDecagram} />
          </div>
        </div>
      </div>
    </CardBox>
  );
};

export default CardBoxUser;
