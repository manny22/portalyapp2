import { AuthLayout } from '@/ui/templates/AuthLayout/AuthLayout'
import { LoginForm } from '@/ui/organisms/LoginForm/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="mb-6 text-center text-xl font-bold text-slate-800">Bienvenido de nuevo</h2>
      <LoginForm />
    </AuthLayout>
  )
}
