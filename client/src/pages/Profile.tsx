import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { User, LogOut, Shield, Key, Calendar, Award, Mail } from "lucide-react";
import { Input } from "../components/ui/input";
import toast from "react-hot-toast";
import api from "../lib/api";

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [resendApiKey, setResendApiKey] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendConfigured, setResendConfigured] = useState(false);
  const [savingResend, setSavingResend] = useState(false);

  useEffect(() => {
    api.get("/auth/resend-config").then((res) => {
      if (res.data?.email) {
        setResendEmail(res.data.email);
      }
      setResendConfigured(!!res.data?.configured);
    }).catch(() => {});
  }, []);

  const handleSaveResend = async () => {
    setSavingResend(true);
    try {
      const body: Record<string, string> = {};
      if (resendApiKey.trim()) body.apiKey = resendApiKey.trim();
      if (resendEmail.trim()) body.email = resendEmail.trim();
      await api.put("/auth/resend-config", body);
      setResendConfigured(true);
      setResendApiKey("");
      toast.success("Email alert configuration saved.");
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to save.";
      toast.error(msg);
    } finally {
      setSavingResend(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-screen items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-light text-[#71717a]">Loading profile context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] py-12 px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header Title */}
        <div className="mb-10">
          <h1 className="text-2xl font-normal text-black tracking-tight">Account Settings</h1>
          <p className="text-sm font-light text-[#71717a] mt-1">
            Manage your credentials and API access tokens.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden mb-6">
          <CardHeader className="p-6 pb-6 flex flex-row items-center gap-4">
            <Avatar className="h-14 w-14 border border-[#e4e4e7]">
              <AvatarFallback className="bg-neutral-50 text-base font-light text-black uppercase">
                {user.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle className="text-base font-medium text-black">{user.username}</CardTitle>
              <CardDescription className="text-xs font-light text-[#71717a]">
                Standard Developer Tier
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 pt-0 border-t border-[#f1f1f4]">
            <div className="divide-y divide-[#f1f1f4]">
              {/* Row 1: Username */}
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-[#71717a] stroke-[1.5]" />
                  <span className="text-xs font-normal text-neutral-600">Username</span>
                </div>
                <span className="text-xs font-light text-black">{user.username}</span>
              </div>

              {/* Row 2: User ID */}
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-[#71717a] stroke-[1.5]" />
                  <span className="text-xs font-normal text-neutral-600">User ID</span>
                </div>
                <span className="text-xs font-mono font-light text-[#71717a] bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">{user.id}</span>
              </div>

              {/* Row 3: Service Status */}
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2.5">
                  <Award className="h-4 w-4 text-[#71717a] stroke-[1.5]" />
                  <span className="text-xs font-normal text-neutral-600">Plan Tier</span>
                </div>
                <span className="text-xs font-light text-emerald-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Developer (Unlimited)
                </span>
              </div>

              {/* Row 4: Static Creation Date */}
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-[#71717a] stroke-[1.5]" />
                  <span className="text-xs font-normal text-neutral-600">Account Created</span>
                </div>
                <span className="text-xs font-light text-neutral-500">May 20, 2026</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t border-[#f1f1f4] bg-neutral-50/40 p-6 flex justify-between items-center">
            <span className="text-[11px] font-light text-[#71717a]">
              Need to rotate credentials? Please contact sysadmin.
            </span>
            <Button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-light text-xs tracking-wide h-9 rounded-lg px-4 flex items-center gap-2 border border-red-100"
            >
              <LogOut className="h-4 w-4 stroke-[1.5]" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Access tokens placeholder info */}
        <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center gap-2.5">
              <Key className="h-4.5 w-4.5 text-black stroke-[1.5]" />
              <CardTitle className="text-sm font-medium text-black">API & Security Keys</CardTitle>
            </div>
            <CardDescription className="text-xs font-light text-[#71717a]">
              These credentials authenticate your shell runner requests securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 text-xs font-light text-neutral-600 leading-relaxed">
            Your active JSON Web Token (JWT) is stored securely inside your browser's local sandbox storage. It automatically signs all cron execution scheduler sync routines. Do not share your auth header with third-party utilities.
          </CardContent>
        </Card>

        {/* Resend Email Alerts Card */}
        <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden mt-6">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4.5 w-4.5 text-black stroke-[1.5]" />
              <CardTitle className="text-sm font-medium text-black">Email Alerts (Resend)</CardTitle>
            </div>
            <CardDescription className="text-xs font-light text-[#71717a]">
              Configure your Resend account to receive email alerts when cron jobs fail.
              Free tier: 100 emails/day.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-3 space-y-4">
            {/* API Key field */}
            <div className="space-y-1.5">
              <label className="text-xs font-normal text-neutral-600">Resend API Key</label>
              <Input
                type="password"
                placeholder="re_..."
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Verified email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-normal text-neutral-600">Verified Sender Email</label>
              <Input
                type="email"
                placeholder="your@gmail.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="h-9 text-xs"
              />
              <p className="text-[11px] font-light text-[#71717a]">
                The Gmail you used to register on Resend.
              </p>
            </div>

            {/* Save + status */}
            <div className="flex items-center justify-between">
              <Button onClick={handleSaveResend} disabled={savingResend} className="h-9 text-xs">
                {savingResend ? "Saving..." : "Save Configuration"}
              </Button>
              {resendConfigured && (
                <span className="text-xs text-emerald-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Configured
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
