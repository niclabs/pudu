/** PasswordResetRequestView.jsx
 * @description Wrapper component for rendering the password reset request page. Displays the password reset request form centrally on the screen
 * @requires pages/login/PasswordResetRequest-form
 * @component
 * @returns {JSX.Element} the rendered page with the password reset request form
 */
import { PasswordResetForm } from "./PasswordResetRequest-form";

export default function PasswordResetRequestView() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-violet-50">
      <div className="w-full max-w-sm">
        <PasswordResetForm />
      </div>
    </div>
  )
}