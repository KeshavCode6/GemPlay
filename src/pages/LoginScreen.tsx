import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Gem } from "lucide-react";
import { Link } from "react-router";

export default function LoginScreen() {
  return (
    <div className="h-screen relative bg-amber-50 flex flex-col items-center p-4 md:p-8">
      <img
        src="/menu.png"
        className="absolute inset-0 max-h-screen z-10 opacity-5 pointer-events-none"
      />
      <header className="w-full max-w-4xl flex items-center justify-between mt-12 mb-8 z-50">
        <div className="flex items-center gap-2 ">
          <Gem className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold ">GemPlay</h1>
        </div>
        <Link to="/">
          <Button
            aria-label="Settings"
            className="text-white"
            style={{ padding: "1.2rem 1rem" }}
          >
            Back
          </Button>
        </Link>
      </header>

      <div className="mt-28">
        <LoginForm />
      </div>
    </div>
  );
}
