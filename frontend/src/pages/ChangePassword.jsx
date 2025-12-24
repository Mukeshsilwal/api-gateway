import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";

export default function ChangePassword() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  const otpInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // reset form on mount (keeps component predictable)
    setEmail("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setErrors({});
  }, []);

  const validateEmail = (value) => {
    return /^\S+@\S+\.\S+$/.test(value);
  };

  const validateAll = (forOtp = false) => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email";

    if (!oldPassword) {
      // reset flow requires OTP and new password
      if (!forOtp && (!newPassword || !confirmPassword)) {
        if (!newPassword) e.newPassword = "New password is required";
        if (!confirmPassword) e.confirmPassword = "Please confirm new password";
      }
    } else {
      // change flow requires oldPassword and new passwords
      if (!newPassword) e.newPassword = "New password is required";
      if (!confirmPassword) e.confirmPassword = "Please confirm new password";
    }

    if (newPassword && newPassword.length < 8)
      e.newPassword = "Password must be at least 8 characters";

    if (newPassword && confirmPassword && newPassword !== confirmPassword)
      e.confirmPassword = "Passwords do not match";

    if (forOtp && !otp) e.otp = "OTP is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    // Only validate email when sending OTP
    if (!email || !validateEmail(email)) {
      setErrors((s) => ({ ...s, email: !email ? "Email is required" : "Enter a valid email" }));
      return;
    }
    // clear OTP-related errors
    setErrors((s) => ({ ...s, otp: undefined }));

    setIsSendingOtp(true);
    try {
      const response = await ApiService.post(API_CONFIG.ENDPOINTS.SEND_OTP, {
        username: email,
      });

      if (response) {
        toast.success("OTP sent to your email");
        setOtpModalVisible(true);
        // focus OTP input after a tick
        setTimeout(() => otpInputRef.current && otpInputRef.current.focus(), 150);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const msg = error.message || "Failed to send OTP";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validateAll(otpModalVisible)) return;

    const resetPasswordMode = oldPassword ? "CHANGE_PASSWORD" : "RESET_PASSWORD";

    setIsSubmitting(true);
    try {
      const response = await ApiService.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
        resetPassword: resetPasswordMode,
        username: email,
        oldPassword: oldPassword || undefined,
        newPassword,
        confirmPassword,
        otp: otp || undefined,
      });

      if (response) {
        toast.success("Password updated — redirecting to login...");
        // clear form
        setEmail("");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setOtpModalVisible(false);

        setTimeout(() => navigate("/admin/login", { replace: true }), 1200);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const msg = error.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl rounded-xl p-8">
        <h2 className="text-2xl font-extrabold text-center text-indigo-700 mb-6">Change Password</h2>

        <div className="grid gap-4">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-200"
          />
          {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}

          <label className="text-sm text-gray-600">Old Password (leave empty if you forgot)</label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full p-3 border rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="Toggle old password visibility"
            >
              {showOldPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label className="text-sm text-gray-600">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-3 border rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="Toggle new password visibility"
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.newPassword && <div className="text-sm text-red-600">{errors.newPassword}</div>}

          <label className="text-sm text-gray-600">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-3 border rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && <div className="text-sm text-red-600">{errors.confirmPassword}</div>}

          <div className="pt-2">
            {!oldPassword ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 disabled:opacity-60"
              >
                {isSendingOtp ? "Sending OTP..." : "Send OTP to Email"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 disabled:opacity-60"
              >
                {isSubmitting ? "Updating..." : "Change Password"}
              </button>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">Or use OTP if you forgot your old password.</div>
        </div>
      </div>

      {otpModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Verify OTP</h3>
              <button
                onClick={() => setOtpModalVisible(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close OTP modal"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">We sent a one-time code to <span className="font-medium">{email}</span>.</p>

            <input
              ref={otpInputRef}
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded-md mb-2"
            />
            {errors.otp && <div className="text-sm text-red-600">{errors.otp}</div>}

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                onClick={() => setOtpModalVisible(false)}
                className="p-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isSubmitting}
                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
              >
                {isSubmitting ? "Verifying..." : "Verify & Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
