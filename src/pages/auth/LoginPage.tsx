import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { resendConfirmation } from '../../lib/supabase';
import MainLayout from '../../components/layout/MainLayout';

interface LocationState {
  redirectTo?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const redirectTo = state?.redirectTo || '/dashboard';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setIsResendingConfirmation(true);
    setError('');

    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        setError('Failed to resend confirmation email. Please try again.');
      } else {
        setConfirmationSent(true);
      }
    } catch (err) {
      setError('An error occurred while resending confirmation email.');
      console.error('Resend confirmation error:', err);
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setShowEmailConfirmation(false);
    setConfirmationSent(false);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Add a small delay to ensure auth state is updated
        setTimeout(() => {
          navigate(redirectTo);
        }, 100);
      } else {
        const errorMessage = result.error || 'Login failed';
        
        // Check if it's an email confirmation error
        if (errorMessage.includes('Email not confirmed') || errorMessage.includes('confirmation')) {
          setShowEmailConfirmation(true);
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to Your Account</h1>
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {showEmailConfirmation && (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-2">Email Confirmation Required</p>
                    <p className="text-sm mb-3">
                      Your account needs to be verified. Please check your email for a confirmation link.
                    </p>
                    {confirmationSent ? (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Confirmation email sent! Check your inbox and spam folder.
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendConfirmation}
                        isLoading={isResendingConfirmation}
                        disabled={isResendingConfirmation}
                      >
                        Resend Confirmation Email
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-2.5 text-gray-500 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </a>
              </div>
              
              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                disabled={isLoading}
              >
                Login
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Register
                </Link>
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Demo accounts:<br />
              Admin: admin@filemarket.com / password<br />
              User: user@filemarket.com / password
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;