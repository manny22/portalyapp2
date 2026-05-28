import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button, Input } from '@/ui/atoms'
import { FormField } from '@/ui/molecules'

const schema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password)
    } catch {
      setError('root', { message: 'Credenciales incorrectas' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField label="Correo electrónico" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="admin@janora.com"
          autoComplete="email"
          {...register('email')}
          leftIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />
      </FormField>

      <FormField label="Contraseña" error={errors.password?.message} required>
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
          leftIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
      </FormField>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" fullWidth loading={isSubmitting} size="lg">
        Iniciar sesión
      </Button>

      <p className="text-center text-xs text-slate-400">
        Demo: <span className="font-medium">admin@janora.com</span> / <span className="font-medium">admin123</span>
      </p>
    </form>
  )
}
