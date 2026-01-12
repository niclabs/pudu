import {PasswordReset} from "./PasswordReset-form";

export default function PasswordResetView() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-violet-50">
          <div className="w-full max-w-sm">
            <PasswordReset />
          </div>
        </div>
      )
    }