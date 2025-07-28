import React from "react";
import { useLocation } from "react-router-dom";
import ChangePasswordForm from "../components/auth/ChangePasswordForm";

const ChangePasswordPage: React.FC = () => {
  const location = useLocation();
  const isFirstLogin = location.state?.isFirstLogin || false;

  return <ChangePasswordForm isFirstLogin={isFirstLogin} />;
};

export default ChangePasswordPage;
