import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Toaster, toast } from 'sonner'


export function RegisterForm() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: { username: "", email: "", password: "", password2: "" },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Registration successful! Redirecting to login.");
        setTimeout(() => {
          navigate("/");
        }, 5000); 
      } else {
        const errorData = await response.json();
        console.log("Registration failed:", JSON.stringify(errorData));
        toast.error("Registration failed: " + JSON.stringify(errorData.username));
      }
    } catch (error) {
      toast.error("Error during registration: " + error.message);
    }
  };

  return (
    <>
    <Toaster />
    <Card className="max-w-md mx-auto m-4 bg-indigo-100 border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              rules={{ required: "Username is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              rules={{ required: "Email is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              rules={{ required: "Password is required" }}
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
            <FormField
                control={form.control}
                name="password2"
                rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                    value === form.watch("password") || "Passwords do not match!",
                    className: "text-red-500",
                }}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <Button type="submit" className="font-bold bg-violet-900 text-violet-50 hover:bg-violet-950 w-full">
              Register
            </Button>
          </form>
          <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/" className="underline underline-offset-4">
          Log in
        </Link>
      </div>
        </Form>
      </CardContent>
    </Card>
    </>
  );
}
