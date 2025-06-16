
import { RegisterForm } from "./registration-form"

export default function RegisterView() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-violet-50">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>
      )
    }