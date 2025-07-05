import { mdiAccount, mdiEye, mdiEyeOff } from "@mdi/js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { patchData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Button from "../components/Form/Button";
import Input from "../components/Form/Input";
import Icon from "../components/Icon";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";

export default function Profile() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <SectionTitleLineWithButton icon={mdiAccount} title="Profile" main />
      <Card className="w-1/3 max-w-full">
        <Grid className="gap-4">
          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              id="current_password"
              label="Current password"
              helperSubtitle="Required"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="pr-10"
            />
            <span
              role="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-2 top-[38px] cursor-pointer p-1"
            >
              <Icon path={showCurrentPassword ? mdiEyeOff : mdiEye} />
            </span>
          </div>

          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              id="new_password"
              label="New password"
              helperSubtitle="Required"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <span
              role="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-[38px] cursor-pointer p-1"
            >
              <Icon path={showNewPassword ? mdiEyeOff : mdiEye} />
            </span>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm_password"
              label="Confirm password"
              helperSubtitle="Required"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <span
              role="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-[38px] cursor-pointer p-1"
            >
              <Icon path={showConfirmPassword ? mdiEyeOff : mdiEye} />
            </span>
          </div>
        </Grid>
        <div className="pt-4">
          <Button text="Submit" onClick={handleSubmit} />
        </div>
      </Card>
    </div>
  );
}
