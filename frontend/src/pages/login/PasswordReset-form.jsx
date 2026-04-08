/** PasswordReset()
 * @description Form view for resetting a user's password using a token
 * Used after the user clicks on the reset link in the email
 * Submits the new password to the backend for verification along with the token from the URL sent in the email
 * 
 * @component
 * @returns {JSX.Element} The rendered password reset form component
 */

import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Toaster, toast } from 'sonner';

export function PasswordReset() {
  const navigate = useNavigate();
  const { token } = useParams(); // Captura el token de la URL /password_reset/:token

  const form = useForm({
    defaultValues: { password: "" },
  });

  const onSubmit = async (data) => {
    try {
      // Usamos el token que sacamos de useParams
      const response = await fetch("http://127.0.0.1:8000/api/password_reset/confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token: token }),
      });

      if (response.ok) {
        toast.success("Password has been reset successfully, directing to login.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error("Error: " + JSON.stringify(errorData));
      }
    } catch (error) {
      toast.error("Error during password reset: " + error.message);
    }
  };

  return (
    <>
      <Toaster richColors />
      <Card className="max-w-md mx-auto m-4 bg-indigo-100 border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="font-bold bg-violet-900 text-violet-50 hover:bg-violet-950 w-full">
                Reset Password
              </Button>
            </form>
            <div className="text-center text-sm">
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
