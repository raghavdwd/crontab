import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Clock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

export const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await register(username.trim(), password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#fafafa] px-6 py-12">
      <div className="w-full max-w-[380px]">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Clock className="h-6 w-6 text-black stroke-[1.5]" />
            <span className="font-sans font-medium text-lg tracking-tight text-black">
              crontab<span className="font-light text-[#71717a]">.sh</span>
            </span>
          </Link>
          <h2 className="mt-4 text-xl font-normal text-black tracking-tight">Create your account</h2>
          <p className="mt-1 text-xs font-light text-[#71717a]">
            Join crontab.sh to automate your scheduled API checks
          </p>
        </div>

        <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-medium text-black">Sign Up</CardTitle>
              <CardDescription className="text-xs font-light text-[#71717a]">
                Get scheduled in seconds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50/50 border border-red-100 p-3 text-xs text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0 stroke-[1.5] mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-normal text-neutral-600">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={submitting}
                  className="h-10 border-[#e4e4e7] bg-[#fafafa]/50 focus-visible:ring-1 focus-visible:ring-[#18181b] rounded-lg text-sm font-light placeholder:text-neutral-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-normal text-neutral-600">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="h-10 border-[#e4e4e7] bg-[#fafafa]/50 focus-visible:ring-1 focus-visible:ring-[#18181b] rounded-lg text-sm font-light placeholder:text-neutral-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 stroke-[1.5]" />
                    ) : (
                      <Eye className="h-4 w-4 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-normal text-neutral-600">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                    className="h-10 border-[#e4e4e7] bg-[#fafafa]/50 focus-visible:ring-1 focus-visible:ring-[#18181b] rounded-lg text-sm font-light placeholder:text-neutral-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 stroke-[1.5]" />
                    ) : (
                      <Eye className="h-4 w-4 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t border-[#f1f1f4] bg-neutral-50/40 p-6">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-10 bg-black hover:bg-black/90 text-white text-sm font-light tracking-wide rounded-lg flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <span className="text-[11px] font-light text-[#71717a]">
                  Already have an account?{" "}
                  <Link to="/login" className="text-black font-normal hover:underline underline-offset-2">
                    Sign in
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
