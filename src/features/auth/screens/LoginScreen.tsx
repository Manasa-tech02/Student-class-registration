import { useState } from 'react';
import { Alert, Button } from 'react-native';
import { Link } from 'expo-router';

import { AuthLayout } from '../components/AuthLayout';
import { AuthTextField } from '../components/AuthTextField';

type LoginFormState = {
  email: string;
  password: string;
};

export function LoginScreen() {
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginFormState>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const nextErrors: Partial<LoginFormState> = {};
    if (!form.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: Call backend /auth/login endpoint
      await new Promise((resolve) => setTimeout(resolve, 600));
      Alert.alert('Login', 'Logged in successfully (stub).');
    } catch (error) {
      Alert.alert('Login failed', 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Login to continue to Student Registration App">
      <AuthTextField
        label="Email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={form.email}
        onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
        error={errors.email}
        placeholder="you@example.com"
      />
      <AuthTextField
        label="Password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        secureToggle
        value={form.password}
        onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
        error={errors.password}
        placeholder="••••••••"
      />
      <Button title={submitting ? 'Logging in...' : 'Login'} onPress={onSubmit} disabled={submitting} />
      <Link href="/signup">
        <Link.Trigger>
          <Button title="Create an account" />
        </Link.Trigger>
      </Link>
    </AuthLayout>
  );
}

