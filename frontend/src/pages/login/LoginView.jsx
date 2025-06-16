
import { LoginForm } from "./login-form"

export default function LoginView() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-violet-50">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      )
    }