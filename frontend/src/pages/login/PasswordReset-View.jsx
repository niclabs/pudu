/** PasswordResetView.jsx
 * @description Wrapper component for the password reset page. Displays the password reset form centrally on the screen.
 * @requires pages/login/PasswordReset-form.jsx for the password reset form component
 * @component
 * @returns {JSX.Element} The rendered password reset view wrapper containing the PasswordReset form
 */
import { PasswordReset } from "./PasswordReset-form";

export default function PasswordResetView() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-violet-50">
      <div className="w-full max-w-sm">
        <PasswordReset />
      </div>
    </div>
  )
}