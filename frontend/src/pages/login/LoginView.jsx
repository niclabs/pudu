/** LoginView.jsx
 * @description Wrapper component for the login page. Displays the login form centrally on the screen.
 * @requires pages/login/login-form.jsx for the login form component
 * @component
 * @returns {JSX.Element} The rendered login view wrapper containing the LoginForm component.
 */
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