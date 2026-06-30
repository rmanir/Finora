import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'rajco' && password === 'Rajco@123') {
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-background">
      {/* Left side - Branding/Visual */}
      <div className="hidden md:flex flex-col w-1/2 bg-zinc-950 p-12 text-white relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[100px]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-2xl">F</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Finora</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Manage your wealth with clarity and precision.
          </h1>
          <p className="text-zinc-400 text-lg">
            Join thousands of users who are taking control of their financial future with our intuitive dashboard and real-time insights.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 relative">
        <div className="w-full max-w-sm space-y-8 relative z-10">
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">F</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Finora</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                  Email or Username
                </label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-primary hover:underline underline-offset-4">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
