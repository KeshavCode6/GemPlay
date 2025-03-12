import Background from "@/components/Background";
import Header from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";

export default function LoginScreen() {
  return (
    <div className="h-screen relative bg-amber-50 flex flex-col items-center p-4 md:p-8">
      <Background /> {/* Background component */}
      <Header /> {/* Header component */}

      {/* Container for the login form */}
      <div className="mt-28 z-50">
        <LoginForm /> {/* Login form component */}
      </div>
    </div>
  );
}
