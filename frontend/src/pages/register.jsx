import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { adminRegistrationValidation } from "../validations/auth.validations";
import { authService } from "../services/authService";

// Icon Components
const UserIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CardIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FileUploadField = ({ id, label, error, touched, onChange, value }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">
      {label}
    </label>
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer
      ${error && touched
          ? "border-red-300 bg-red-50"
          : value
            ? "border-green-300 bg-green-50"
            : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
        }`}
    >
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center justify-center text-center pointer-events-none">
        {value ? (
          <>
            <CheckCircleIcon />
            <p className="text-green-700 font-medium">{value.name}</p>
            <p className="text-xs text-green-600 mt-1">Click to change</p>
          </>
        ) : (
          <>
            <UploadIcon />
            <p className="text-sm font-medium text-slate-700">
              <span className="text-indigo-600">Upload a file</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
          </>
        )}
      </div>
    </div>

    {error && touched && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

const InputField = ({ id, label, icon: Icon, error, touched, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
        <Icon />
      </div>
      <input
        id={id}
        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-colors ${error && touched
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-indigo-500"
          }`}
        {...props}
      />
    </div>
    {error && touched && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      citizenshipNumber: "",
      frontImage: null,
      backImage: null,
    },

    validationSchema: adminRegistrationValidation,

    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        // Validate file sizes (max 5MB)
        if (values.frontImage && values.frontImage.size > 5 * 1024 * 1024) {
          toast.error("Front image must be less than 5MB");
          return;
        }
        if (values.backImage && values.backImage.size > 5 * 1024 * 1024) {
          toast.error("Back image must be less than 5MB");
          return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (val) formData.append(key, val);
        });
        // Ensure role is sent as ADMIN
        formData.append("role", "ADMIN");

        await authService.registerAdmin(formData);

        toast.success("Application submitted successfully! Please wait for approval.");
        navigate("/admin/login");
      } catch (err) {
        console.error("Registration error:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to submit application. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue } = formik;

  const handleFileChange = (e, fieldName) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPG, JPEG, or PNG)");
        return;
      }
      setFieldValue(fieldName, file);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">Admin Registration</h1>
          <p className="text-indigo-100 text-lg">
            Join our platform as an administrator. Submit your application and wait for approval.
          </p>
        </div>

        <div className="space-y-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Secure Verification</h3>
              <p className="text-indigo-100 text-sm">All applications are reviewed for security and authenticity</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Quick Approval Process</h3>
              <p className="text-indigo-100 text-sm">Most applications are reviewed within 24-48 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Admin Account</h2>
            <p className="text-slate-600">Fill in your details to submit your application</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              id="fullName"
              label="Full Name"
              icon={UserIcon}
              placeholder="John Doe"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fullName}
              touched={touched.fullName}
            />

            <InputField
              id="email"
              type="email"
              label="Email Address"
              icon={EmailIcon}
              placeholder="john@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
            />

            <InputField
              id="phone"
              label="Phone Number"
              icon={PhoneIcon}
              placeholder="+977 9800000000"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
            />

            <InputField
              id="citizenshipNumber"
              label="Citizenship Number"
              icon={CardIcon}
              placeholder="12345-6789-0123"
              value={values.citizenshipNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.citizenshipNumber}
              touched={touched.citizenshipNumber}
            />

            <FileUploadField
              id="frontImage"
              label="Citizenship Front Image"
              onChange={(e) => handleFileChange(e, "frontImage")}
              value={values.frontImage}
              error={errors.frontImage}
              touched={touched.frontImage}
            />

            <FileUploadField
              id="backImage"
              label="Citizenship Back Image"
              onChange={(e) => handleFileChange(e, "backImage")}
              value={values.backImage}
              error={errors.backImage}
              touched={touched.backImage}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/admin/login" className="text-indigo-600 font-medium hover:text-indigo-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}