import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate(); // Hook to navigate between pages

  // Function to handle user login
  async function signIn(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault(); // Prevent default form submission
    const form = e.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      email: { value: string };
      password: { value: string };
    };

    // Signing in user with Supabase authentication
    await supabase.auth.signUp({
      email: formElements.email.value,
      password: formElements.password.value,
    });

    navigate("/login"); // Redirect to home page after successful login
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
          <CardDescription>
            Enter the email you wish to create your account with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={signIn}>
            <div className="flex flex-col gap-6">
              {/* Email Input Field */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>

              {/* Password Input Field */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
