import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { postData } from "../api/api";
import { getKryveaShadow } from "../api/cookie";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Subtitle from "../components/Composition/Subtitle";
import Button from "../components/Form/Button";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import { getPageTitle } from "../config";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(() => location.state?.from || "/dashboard", []);

  useEffect(() => {
    const kryveaShadow = getKryveaShadow();

    if (kryveaShadow && kryveaShadow !== "password_expired") {
      navigate(from, { replace: true });
      return;
    }
    document.title = getPageTitle("Login");
  }, []);

  const handleSubmit = () => {
    setError("");
    postData(
      "/api/login",
      { username, password, remember },
      () => navigate(from, { replace: true }),
      err => {
        // Check for password expired case
        const data = err.response?.data as { error: string };
        if (data?.error === "Password expired") {
          setError("");
          // Clear password input for reset
          setPassword("");
        } else {
          setError(data?.error || "Login failed");
        }
      }
    );
  };

  // Password reset submit handler
  const handlePasswordReset = () => {
    setError("");

    if (!password) {
      setError("New password is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    postData(
      "/api/password/reset",
      { password },
      () => {
        toast.success("Password change successful");
        navigate(from, { replace: true });
      },
      err => {
        setError(err.response?.data?.error || "Failed to reset password");
      }
    );
  };

  return (
    <div className="card-modal fixed flex min-h-screen w-screen items-center justify-center">
      <Card className="glasscard">
        {getKryveaShadow() !== "password_expired" ? (
          // LOGIN FORM
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Grid className="gap-4 p-1">
              <Input
                type="text"
                id="username"
                label="Username"
                onChange={e => setUsername(e.target.value)}
                value={username}
                autoFocus
              />
              <Input
                type="password"
                id="password"
                label="Password"
                onChange={e => setPassword(e.target.value)}
                value={password}
              />
              <Checkbox id={"remember_me"} onChange={e => setRemember(e.target.checked)} label={"Remember me"} />
              <Subtitle className="text-[color:--error]" text={error} />
              <Button text="Login" className="justify-center" formSubmit />
            </Grid>
          </form>
        ) : (
          // PASSWORD RESET FORM
          <form
            onSubmit={e => {
              e.preventDefault();
              handlePasswordReset();
            }}
          >
            <Grid className="gap-4 p-1">
              <p className="text-center">
                Your password has expired.
                <br />
                Please enter a new password to reset it.
              </p>
              <Input
                type="password"
                id="password"
                label="New Password"
                onChange={e => setPassword(e.target.value)}
                value={password}
                autoFocus
              />
              <Input
                type="password"
                id="confirm_password"
                label="Confirm New Password"
                onChange={e => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
              <Subtitle className="text-[color:--error]" text={error} />
              <Button text="Reset Password" className="justify-center" formSubmit />
            </Grid>
          </form>
        )}
      </Card>
    </div>
  );
}
