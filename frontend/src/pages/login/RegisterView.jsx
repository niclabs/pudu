/** RegisterView.jsx
 * @description Wrapper component for rendering the user registration page. Displays the registration form centrally on the screen
 * @requires pages/login/registration-form
 * @component
 * @returns {JSX.Element} The rendered register view wrapper containing the RegisterForm component.
 */
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