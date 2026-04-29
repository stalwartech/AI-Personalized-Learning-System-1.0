import {React, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import * as yup from 'yup';
import {Eye} from 'lucide-react'


// Validation schema
const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean()
}).required();

const LoginForm = () => {
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate()
  const {register,handleSubmit,formState: { errors }} = useForm({resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const baseUrl = "http://localhost:3021/login";
    console.log('Form submitted:', data);
    // Handle your login logic here
    try {
      const response = await axios.post(baseUrl, data);
      console.log(response);
      
      if(response.status === 200){
        console.log(response);
        alert('Login successful!');
        navigate('/');
        localStorage.setItem("token", response.data.token)
      }
 
    } catch (error) {
      // alert(error.response?.data?.message || "Invalid email or password");
      // setLoginError(error.response?.data?.message || "Invalid email or password");
      setLoginError("Invalid email or password");
    }
    finally {
      setIsLoading(false);
    }
  }
  ;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🎓</span>
            <h1 className="text-3xl font-bold text-gray-800">AI Learning</h1>
          </div>
          <p className="text-gray-500">Welcome back! Sign in to continue learning</p>
        </div>

        {loginError && <p className="error text-red-600 mb-4 text-center">{loginError}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input id="email" type="email"
              {...register('email')}
              placeholder="Abdulsalamakintaro@example.com"
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div>
              <input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Eye className="w-5 h-5 text-gray-500" />
              </div>
            </div>
      
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input id="rememberMe" type="checkbox" {...register('rememberMe')} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">Remember me</label>
          </div>

          {/* Submit Button */}
          <button disabled={isLoading} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">  {isLoading ? 'Signing in...' : 'Sign in'}</button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">Don't have an account?{' '}
            <a href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;