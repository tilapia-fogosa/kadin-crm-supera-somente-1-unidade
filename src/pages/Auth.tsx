
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthState } from "@/hooks/useAuthState";
import { SuperaLogo } from "@/components/auth/SuperaLogo";
import { Card, CardContent } from "@/components/ui/card";

export default function Auth() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
    session,
    isCheckingSession,
    navigate,
    toast,
  } = useAuthState();

  useEffect(() => {
    if (session) {
      console.log("Usuário autenticado, redirecionando para dashboard");
      // Delay redirection to show success message
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    }
  }, [session, navigate]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <SuperaLogo />
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            setLoading={setLoading}
            toast={toast}
            navigate={navigate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
