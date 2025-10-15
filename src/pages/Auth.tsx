import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Loader2, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email invalide');
const passwordSchema = z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères');

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue !',
        });
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: 'Compte créé',
          description: 'Vous pouvez maintenant vous connecter.',
        });
        
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 animate-fade-in shadow-2xl border-2">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
            <BarChart3 className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BarFlowTrack
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom complet
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Votre nom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                disabled={loading}
                className="transition-all duration-300"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="transition-all duration-300"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : isLogin ? (
              'Se connecter'
            ) : (
              'Créer mon compte'
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
          </p>
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="font-semibold"
          >
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
