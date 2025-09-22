import React, { useState, useEffect } from 'react';
import { Search, Package, Users, TrendingUp, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalData } from '@/hooks/useLocalData';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'inventory' | 'sales' | 'staff' | 'navigation';
  action: () => void;
  icon: React.ReactNode;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const navigate = useNavigate();
  const { getInventory, getSales, getStaff } = useLocalData();
  const debouncedQuery = useDebounce(query, 300);

  // Navigation items
  const navigationItems: SearchResult[] = [
    {
      id: 'nav-dashboard',
      title: 'Tableau de bord',
      subtitle: 'Vue d\'ensemble de l\'activité',
      category: 'navigation',
      action: () => navigate('/'),
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'nav-sales',
      title: 'Ventes',
      subtitle: 'Gestion des ventes et transactions',
      category: 'navigation',
      action: () => navigate('/sales'),
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'nav-inventory',
      title: 'Stock',
      subtitle: 'Gestion de l\'inventaire',
      category: 'navigation',
      action: () => navigate('/inventory'),
      icon: <Package className="w-4 h-4" />
    },
    {
      id: 'nav-staff',
      title: 'Personnel',
      subtitle: 'Gestion des employés',
      category: 'navigation',
      action: () => navigate('/staff'),
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'nav-settings',
      title: 'Paramètres',
      subtitle: 'Configuration de l\'application',
      category: 'navigation',
      action: () => navigate('/settings'),
      icon: <Settings className="w-4 h-4" />
    }
  ];

  // Recherche dans les données
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = debouncedQuery.toLowerCase();

    // Recherche dans la navigation
    navigationItems.forEach(item => {
      if (item.title.toLowerCase().includes(lowerQuery) || 
          item.subtitle.toLowerCase().includes(lowerQuery)) {
        searchResults.push(item);
      }
    });

    // Recherche dans l'inventaire
    const inventory = getInventory();
    inventory.forEach(item => {
      if (item.name.toLowerCase().includes(lowerQuery) || 
          item.category.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: `inv-${item.id}`,
          title: item.name,
          subtitle: `Stock: ${item.quantity} • ${item.category}`,
          category: 'inventory',
          action: () => navigate('/inventory'),
          icon: <Package className="w-4 h-4" />
        });
      }
    });

    // Recherche dans le personnel
    const staff = getStaff();
    staff.forEach(member => {
      if (member.name.toLowerCase().includes(lowerQuery) || 
          member.role.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: `staff-${member.id}`,
          title: member.name,
          subtitle: `${member.role} • Actif`,
          category: 'staff',
          action: () => navigate('/staff'),
          icon: <Users className="w-4 h-4" />
        });
      }
    });

    setResults(searchResults.slice(0, 8)); // Limiter à 8 résultats
    setSelectedIndex(0);
  }, [debouncedQuery, getInventory, getSales, getStaff, navigate]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'inventory': return 'Stock';
      case 'sales': return 'Ventes';
      case 'staff': return 'Personnel';
      default: return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'bg-primary/20 text-primary';
      case 'inventory': return 'bg-blue-500/20 text-blue-500';
      case 'sales': return 'bg-green-500/20 text-green-500';
      case 'staff': return 'bg-purple-500/20 text-purple-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Recherche globale
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans l'application..."
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {query && (
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="px-6 pb-6">
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        result.action();
                        onClose();
                      }}
                    >
                      <div className="p-2 bg-muted/50 rounded-lg">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {result.title}
                          </p>
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(result.category)}`}>
                            {getCategoryLabel(result.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-6 pb-6 text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun résultat trouvé pour "{query}"</p>
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Utilisez ↑↓ pour naviguer, ↵ pour sélectionner</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">Ctrl</Badge>
              <span>+</span>
              <Badge variant="outline" className="text-xs">K</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;