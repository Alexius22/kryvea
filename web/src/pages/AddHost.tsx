import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import { getPageTitle } from "../config";

export default function AddHost() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();

  const [ipv4, setIpv4] = useState("");
  const [ipv6, setIpv6] = useState("");
  const [fqdn, setFqdn] = useState("");
  const [hostName, setHostName] = useState("");

  useEffect(() => {
    document.title = getPageTitle("Add Host");
  }, []);

  const handleSubmit = () => {
    const payload = {
      ipv4: ipv4.trim() || undefined,
      ipv6: ipv6.trim() || undefined,
      fdqn: fqdn.trim() || undefined,
      name: hostName.trim() || undefined,
    };

    postData<{ message: string }>(
      `/api/customers/${customerId}/targets`,
      payload,
      () => {
        toast.success("Host added successfully");
        navigate(`/customers/${customerId}/targets`);
      },
      err => {
        toast.error(err.response.data.error);
      }
    );
  };

  return (
    <div>
      <Card>
        <Grid className="gap-4">
          <Input
            type="text"
            id="ipv4"
            label="IPv4"
            placeholder="IPv4 address"
            value={ipv4}
            onChange={e => setIpv4(e.target.value)}
          />
          <Input
            type="text"
            id="ipv6"
            label="IPv6"
            placeholder="IPv6 address"
            value={ipv6}
            onChange={e => setIpv6(e.target.value)}
          />
          <Input
            type="text"
            id="fqdn"
            label="FQDN"
            placeholder="Fully Qualified Domain Name"
            value={fqdn}
            onChange={e => setFqdn(e.target.value)}
          />
          <Input
            type="text"
            id="name"
            label="Name"
            placeholder="This name is used to differentiate between duplicate entries"
            value={hostName}
            onChange={e => setHostName(e.target.value)}
          />
          <Divider />
          <Buttons>
            <Button text={"Submit"} onClick={handleSubmit} />
            <Button type="outline-only" text="Cancel" onClick={() => navigate(`/customers/${customerId}/targets`)} />
          </Buttons>
        </Grid>
      </Card>
    </div>
  );
}
