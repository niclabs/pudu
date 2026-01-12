import {PasswordResetForm} from "./PasswordResetRequest-form";

export default function PasswordResetRequestView() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-violet-50">
          <div className="w-full max-w-sm">
            <PasswordResetForm />
          </div>
        </div>
      )
    }