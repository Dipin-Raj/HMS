import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, getRoleRoute } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from '@/types/auth';


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || getRoleRoute(user.role);
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a role');
      return;
    }
    
    try {
      await login({ username, password, organization, role });
      // AuthContext will update, causing re-render and redirect above
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground text-primary font-bold text-xl">
              H
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">HealthCare HMS</h1>
              <p className="text-sm text-primary-foreground/80">AI-Powered Hospital Management</p>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Streamline Your Hospital Operations
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Modern healthcare management with AI-powered insights, seamless scheduling, 
            and comprehensive patient care tracking.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">98%</p>
              <p className="text-sm text-primary-foreground/70">Patient Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">45%</p>
              <p className="text-sm text-primary-foreground/70">Faster Processing</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">24/7</p>
              <p className="text-sm text-primary-foreground/70">System Availability</p>
            </div>
          </div>
        </motion.div>

        <p className="text-sm text-primary-foreground/60">© 2024 HealthCare HMS. All rights reserved.</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    type="text"
                    placeholder="Enter your organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select onValueChange={setRole} value={role}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
              {role === 'admin' && (
                <div className="mt-4 text-center text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="underline">
                    Sign up
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
