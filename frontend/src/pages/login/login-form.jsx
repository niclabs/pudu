import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AuthService } from '/src/utils/authservice.jsx';
import { useState } from "react";

export function LoginForm() {
  const [inlineErr, setInlineErr] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data) => {
    try {
      console.log("Submitting login data:", data);
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const tokens = await response.json();
        AuthService.setAccessToken(tokens.access);
        AuthService.setRefreshToken(tokens.refresh);
        console.log(tokens)
        navigate("/sysrev");
      } else {
        setInlineErr(true);
        console.error("Login failed");
      }
    } catch (error) {
      console.error("An error occurred during login", error);
    }
  };

  return (
    <Card className="max-w-md mx-auto m-4 bg-indigo-100 border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormMessage
              className={`text-red-600 text-center h-0 transition-opacity duration-300 ${inlineErr ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
              Invalid username or password!
            </FormMessage>

            <Button type="submit" className="font-bold bg-violet-900 text-violet-50 hover:bg-violet-950 w-full">
              Login
            </Button>
          </form>
          <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
        </Form>
      </CardContent>
    </Card>
  );
}
