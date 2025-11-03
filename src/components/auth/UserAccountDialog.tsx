import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  role: string;
}

export const UserAccountDialog = () => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        toast({
          title: "Erreur d'authentification",
          description: "Impossible de récupérer l'utilisateur actuel.",
          variant: "destructive"
        });
        return;
      }
      
      if (!user) {
        console.error('No user found');
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil.",
          variant: "destructive"
        });
      }

      // Fetch role data
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      }

      // Set profile with user data as fallback
      setProfile({
        email: profileData?.email || user.email || '',
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        phone: profileData?.phone || '',
        avatar_url: profileData?.avatar_url || '',
        role: roleData?.role || 'user'
      });
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès."
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt!"
      });
      navigate('/welcome');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter.",
        variant: "destructive"
      });
    }
  };

  const getInitials = () => {
    if (!profile) return 'U';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mon Compte</DialogTitle>
          <DialogDescription>
            Gérez vos informations personnelles
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <Badge variant={getRoleBadgeVariant(profile.role)} className="mt-2">
                  {profile.role === 'admin' ? 'Administrateur' : 
                   profile.role === 'moderator' ? 'Modérateur' : 'Utilisateur'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL de l'avatar</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex-1"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Impossible de charger le profil
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
