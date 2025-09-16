import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { postData } from "../api/api";
import Card from "../components/Composition/Card";
import Divider from "../components/Composition/Divider";
import Grid from "../components/Composition/Grid";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import { Target } from "../types/common.types";
import { getPageTitle } from "../utils/helpers";

export default function AddTarget() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();

  const [ipv4, setIpv4] = useState("");
  const [ipv6, setIpv6] = useState("");
  const [fqdn, setFqdn] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    document.title = getPageTitle("New Target");
  }, []);

  const handleSubmit = () => {
    const payload = {
      ipv4: ipv4.trim(),
      ipv6: ipv6.trim(),
      fqdn: fqdn.trim(),
      name: tag.trim(),
      customer_id: customerId,
    };

    postData<Target>(`/api/targets`, payload, () => {
      toast.success("Target added successfully");
      navigate(-1);
    });
  };

  return (
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
          label="FQDN | Target name"
          placeholder="Fully Qualified Domain Name or target name"
          value={fqdn}
          onChange={e => setFqdn(e.target.value)}
        />
        <Input
          type="text"
          id="tag"
          label="Tag"
          placeholder="This value is used to differentiate between duplicate entries"
          value={tag}
          onChange={e => setTag(e.target.value)}
        />
        <Divider />
        <Buttons>
          <Button text={"Submit"} onClick={handleSubmit} />
          <Button variant="outline-only" text="Cancel" onClick={() => navigate(-1)} />
        </Buttons>
      </Grid>
    </Card>
  );
}
