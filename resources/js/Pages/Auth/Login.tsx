import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false as boolean,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <GuestLayout>
      <Head title="Log in" />

      {/* Header Section */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-600">Please enter your details to sign in</p>
      </div>

      {status && (
        <div className="mb-4 rounded-md bg-green-50 p-4 text-sm font-medium text-green-600 border border-green-200">
          {status}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        {/* Email Input Group */}
        <div>
          <InputLabel htmlFor="email" value="Email" />
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {/* Email Icon SVG */}
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <TextInput
              id="email"
              type="email"
              name="email"
              value={data.email}
              className="block w-full pl-10 py-2.5 sm:text-sm" // Added pl-10 for icon space
              autoComplete="username"
              isFocused={true}
              placeholder="name@company.com"
              onChange={(e) => setData('email', e.target.value)}
            />
          </div>
          <InputError message={errors.email} className="mt-2" />
        </div>

        {/* Password Input Group */}
        <div>
          <InputLabel htmlFor="password" value="Password" />
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {/* Lock Icon SVG */}
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <TextInput
              id="password"
              type="password"
              name="password"
              value={data.password}
              className="block w-full pl-10 py-2.5 sm:text-sm"
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={(e) => setData('password', e.target.value)}
            />
          </div>
          <InputError message={errors.password} className="mt-2" />
        </div>

        {/* Options Row: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData('remember', (e.target.checked || false) as false)}
            />
            <span className="ms-2 text-sm text-gray-600">Remember me</span>
          </label>

          {canResetPassword && (
            <Link
              href={route('password.request')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Forgot password?
            </Link>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <PrimaryButton
            className="w-full justify-center py-3 text-base transition-all duration-200 ease-in-out hover:bg-gray-800 active:scale-95"
            disabled={processing}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              'Sign in'
            )}
          </PrimaryButton>
        </div>

        {/* Optional: Sign Up Prompt */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href={route('register')}
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </GuestLayout>
  );
}
