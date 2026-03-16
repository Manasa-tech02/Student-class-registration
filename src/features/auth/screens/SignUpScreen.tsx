import { useState } from 'react';
import { Alert, Button } from 'react-native';
import { Link } from 'expo-router';

import { AuthLayout } from '../components/AuthLayout';
import { AuthTextField } from '../components/AuthTextField';

type SignUpFormState = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignUpScreen() {
  const [form, setForm] = useState<SignUpFormState>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpFormState>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const nextErrors: Partial<SignUpFormState> = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!form.username.trim()) {
      nextErrors.username = 'Username is required';
    }
    if (!form.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: Call backend /auth/register endpoint
      await new Promise((resolve) => setTimeout(resolve, 600));
      Alert.alert('Sign up', 'Account created successfully (stub).');
    } catch (error) {
      Alert.alert('Sign up failed', 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Sign up to start managing students">
      <AuthTextField
        label="Full name"
        autoCapitalize="words"
        value={form.name}
        onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
        error={errors.name}
        placeholder="John Doe"
      />
      <AuthTextField
        label="Username"
        autoCapitalize="none"
        autoCorrect={false}
        value={form.username}
        onChangeText={(username) => setForm((prev) => ({ ...prev, username }))}
        error={errors.username}
        placeholder="john_doe"
      />
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
      <AuthTextField
        label="Confirm password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        secureToggle
        value={form.confirmPassword}
        onChangeText={(confirmPassword) => setForm((prev) => ({ ...prev, confirmPassword }))}
        error={errors.confirmPassword}
        placeholder="••••••••"
      />
      <Button title={submitting ? 'Creating account...' : 'Sign up'} onPress={onSubmit} disabled={submitting} />
      <Link href="/login">
        <Link.Trigger>
          <Button title="Already have an account? Login" />
        </Link.Trigger>
      </Link>
    </AuthLayout>
  );
}

