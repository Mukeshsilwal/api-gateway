import * as Yup from "yup";

export const loginRegisterValidation = Yup.object({

  //password validation
  password: Yup.string()
    .min(5, "Password must be greater than 6 characters.")
    .max(50, "Password limit reached.")
    .required("Password is required."),
});

export const adminRegistrationValidation = Yup.object({
  fullName: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name limit reached")
    .required("Full Name is required"),
  email: Yup.string()
    .email("Invalid Email")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  citizenshipNumber: Yup.string()
    .required("Citizenship Number is required"),
  frontImage: Yup.mixed()
    .required("Citizenship Front Image is required"),
  backImage: Yup.mixed()
    .required("Citizenship Back Image is required"),
});
