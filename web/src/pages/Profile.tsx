import { mdiAccount } from "@mdi/js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { patchData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Input from "../components/Form/Input";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";

export default function Profile() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    document.title = getPageTitle("Profile");
  }, []);

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    patchData<{ message: string }>("/api/users/me", payload, () => {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  };

  return (
    <div>
      <SectionTitleLineWithButton icon={mdiAccount} title="Profile" />
      <Card className="w-1/3 max-w-full">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Grid className="gap-4 p-1">
            <Input
              type={"password"}
              id="current_password"
              label="Current password"
              helperSubtitle="Required"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />

            <Input
              type={"password"}
              id="new_password"
              label="New password"
              helperSubtitle="Required"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              id="confirm_password"
              label="Confirm password"
              helperSubtitle="Required"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </Grid>
          <Divider />
          <Button text="Update" formSubmit />
        </form>
      </Card>
    </div>
  );
}
