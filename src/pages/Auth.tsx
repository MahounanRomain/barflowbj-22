import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Adresse e-mail invalide');
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
    let mounted = true;
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && event === 'SIGNED_IN' && session) {
        navigate('/', { replace: true });
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({
          title: 'Connexion réussie',
          description: 'Content de vous revoir !'
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        toast({
          title: 'Compte créé avec succès',
          description: 'Un e-mail de confirmation vient de vous être envoyé. Vérifiez votre boîte de réception.',
          duration: 7000
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const message = error.message?.includes('Invalid login')
        ? 'Identifiants incorrects. Vérifiez votre e-mail et mot de passe.'
        : error.message?.includes('already registered')
        ? 'Cette adresse e-mail est déjà utilisée.'
        : error.message || 'Une erreur inattendue est survenue. Réessayez.';
      toast({
        variant: 'destructive',
        title: 'Impossible de continuer',
        description: message
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
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BarFlow
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin
                ? 'Retrouvez votre tableau de bord'
                : 'Créez votre espace de gestion en quelques secondes'}
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
                placeholder="Prénom et nom"
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
              Adresse e-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
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
              placeholder="6 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="transition-all duration-300"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Veuillez patienter…
              </>
            ) : (
              <>
                {isLogin ? 'Me connecter' : 'Créer mon compte'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}
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
