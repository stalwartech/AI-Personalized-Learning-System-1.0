import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const schema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the Terms & Conditions')
    .required('You must agree to the Terms & Conditions')
}).required();

// Password strength calculator
const calculatePasswordStrength = (password) => {
  if (!password) return { strength: 0, text: '', color: '' };

  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  // Calculate strength score
  if (checks.length) strength += 20;
  if (checks.lowercase) strength += 20;
  if (checks.uppercase) strength += 20;
  if (checks.number) strength += 20;
  if (checks.special) strength += 20;

  // Determine strength level
  if (strength <= 40) {
    return { 
      strength, 
      text: 'Weak strength', 
      color: 'bg-red-500',
      textColor: 'text-red-600'
    };
  } else if (strength <= 60) {
    return { 
      strength, 
      text: 'Medium strength', 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    };
  } else if (strength <= 80) {
    return { 
      strength, 
      text: 'Good strength', 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    };
  } else {
    return { 
      strength, 
      text: 'Strong password', 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    };
  }
};

// Get password requirements
const getPasswordRequirements = (password) => {
  return [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { text: 'Contains number (0-9)', met: /[0-9]/.test(password) },
    { text: 'Contains special character (!@#$%)', met: /[^A-Za-z0-9]/.test(password) }
  ];
};

const Register = () => {
  const [passwordStrength, setPasswordStrength] = useState({ 
    strength: 0, 
    text: '', 
    color: '',
    textColor: ''
  });

  const {register,handleSubmit,watch,formState: { errors }} = useForm({resolver: yupResolver(schema),defaultValues: {fullName: '',email: '',password: '',agreeToTerms: false}});

  // Watch password field for strength calculation
  const password = watch('password');

  // Update password strength when password changes
  React.useEffect(() => {
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle your signup logic here
  };

  // Get current requirements
  const requirements = getPasswordRequirements(password || '');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🎓</span>
            <h1 className="text-3xl font-bold text-gray-800">AI Learning</h1>
          </div>
          <p className="text-gray-500">Create your account and start learning anything</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              placeholder="John Doe"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Create a strong password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
                {/* Strength Text */}
                <p className={`text-xs ${passwordStrength.textColor} font-medium mb-2`}>
                  {passwordStrength.text}
                </p>

                {/* Requirements Checklist */}
                {passwordStrength.strength < 100 && (
                  <div className="space-y-1">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                          {req.met ? '✓' : '○'}
                        </span>
                        <span className={`text-xs ${req.met ? 'text-green-600 line-through' : 'text-gray-600'}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div>
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                type="checkbox"
                {...register('agreeToTerms')}
                className={`w-4 h-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
                  errors.agreeToTerms ? 'border-red-500' : ''
                }`}
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Terms & Conditions
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Create Account
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;