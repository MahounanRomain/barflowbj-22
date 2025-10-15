import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package, Users } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-xl">
              <BarChart3 className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
            BarFlowTrack
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La solution complète pour gérer votre bar avec efficacité
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-12">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Gestion des stocks</h3>
              <p className="text-sm text-muted-foreground">
                Suivez votre inventaire en temps réel et optimisez vos commandes
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Analyses détaillées</h3>
              <p className="text-sm text-muted-foreground">
                Analysez vos ventes et performances avec des rapports précis
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Gestion d'équipe</h3>
              <p className="text-sm text-muted-foreground">
                Gérez votre personnel et suivez les performances individuelles
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-500">
            <Link to="/auth/login">
              Se connecter
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-500">
            <Link to="/auth/signup">
              Créer un compte
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
          by Romain Sergio BOGNISSOU
        </p>
      </div>
    </div>
  );
};

export default Welcome;
