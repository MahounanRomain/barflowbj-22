import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="p-8 text-center bg-card/50 backdrop-blur-xl border shadow-2xl">
          <div className="mb-8">
            <div className="text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer mb-4">
              404
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full animate-pulse" />
          </div>

          <div className="mb-8 space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              Page introuvable
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'accueil.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full hover:bg-accent/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Page précédente
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
