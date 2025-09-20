import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Loader2,
  Eye,
  EyeOff,
  Fuel,
  Info,
  Mail,
  Phone,
  Building2,
  Globe,
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

// Validation schema
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  pumpCode: z
    .string()
    .min(1, 'Pump Code is required')
    .min(4, 'Pump Code must be at least 4 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// API types
interface LoginRequest {
  username: string;
  password: string;
  pumpCode: string;
}

interface LoginResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  pumpMasterId: string;
  role: string;
  mobileNumber: string;
  enabled: boolean;
}

// Company Info Component
const CompanyInfo = () => (
  <div className="space-y-4 p-1">
    <div className="flex items-center gap-2 text-primary">
      <Fuel className="h-5 w-5" />
      <h3 className="font-semibold">FuelTech Solutions</h3>
    </div>

    <div className="space-y-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <span>Leading Fuel Management Systems</span>
      </div>

      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <span>support@fueltech.com</span>
      </div>

      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        <span>+1 (555) 123-4567</span>
      </div>

      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>www.fueltech.com</span>
      </div>
    </div>

    <Separator />

    <p className="text-xs text-muted-foreground">
      Trusted by over 10,000+ fuel stations worldwide since 2015
    </p>
  </div>
);

export function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      pumpCode: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>(
        '/api/v1/users/login',
        data as LoginRequest
      );
      const loginData = response.data;

      // Use auth context to login
      login(loginData.token, {
        userId: loginData.userId,
        username: loginData.username,
        pumpMasterId: loginData.pumpMasterId,
        role: loginData.role,
        mobileNumber: loginData.mobileNumber,
        enabled: loginData.enabled,
      });

      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Fuel className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your fuel management account
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          className="h-10"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="h-10 pr-10"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pumpCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pump Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter pump code"
                          className="h-10"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Separator />

            <div className="flex items-center justify-between w-full text-sm">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Password Recovery</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Contact your system administrator or pump station manager
                      to reset your password.
                    </p>
                    <Separator />
                    <CompanyInfo />
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-muted-foreground hover:text-primary"
                  >
                    Need an account?
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Account Registration</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New accounts must be created by your system administrator.
                      Contact support for assistance.
                    </p>
                    <Separator />
                    <CompanyInfo />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 FuelTech Solutions. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
