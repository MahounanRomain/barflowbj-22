
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="p-8 text-center bg-card/50 backdrop-blur-xl border shadow-2xl">
          {/* Animated 404 */}
          <div className="mb-8">
            <div className="text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer mb-4">
              404
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full animate-pulse"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              Oops! Page introuvable
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              La page que vous recherchez n'existe pas ou a été déplacée. 
              Veuillez vérifier l'URL ou retourner à l'accueil.
            </p>
            {location.pathname !== "/" && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-mono">
                  Route non trouvée: {location.pathname}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                import('react-router-dom').then(({ useNavigate }) => {
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                });
              }}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Home className="w-5 h-5 mr-2" />
              Retourner à l'accueil
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

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </Card>

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
