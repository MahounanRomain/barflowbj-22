
import React from "react";
import { FileText, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const SpecificationGenerator: React.FC = () => {
  const { toast } = useToast();

  const generateSpecification = () => {
    const specification = {
      project: {
        name: "BarFlowTrack",
        version: "2.2.0",
        description: "Application de gestion intelligente de bar",
        author: "Romain Sergio BOGNISSOU",
        contact: "romainmahougnon@gmail.com",
        date: new Date().toLocaleDateString('fr-FR')
      },
      overview: {
        title: "Vue d'ensemble",
        description: "BarFlowTrack est une application web progressive conçue pour la gestion complète d'un établissement de bar. Elle offre une interface moderne et intuitive pour gérer l'inventaire, les ventes, le personnel et générer des rapports détaillés.",
        objectives: [
          "Simplifier la gestion quotidienne d'un bar",
          "Optimiser le suivi des stocks et des ventes",
          "Faciliter la gestion du personnel",
          "Fournir des analyses et rapports détaillés",
          "Offrir une expérience utilisateur moderne et responsive"
        ]
      },
      technicalStack: {
        title: "Stack Technique",
        frontend: [
          "React 18.3.1 - Bibliothèque JavaScript pour l'interface utilisateur",
          "TypeScript - Typage statique pour JavaScript",
          "Vite - Outil de build rapide",
          "Tailwind CSS - Framework CSS utilitaire",
          "Shadcn/ui - Composants UI modernes",
          "React Router - Navigation côté client",
          "Lucide React - Icônes modernes",
          "Recharts - Graphiques et visualisations"
        ],
        storage: [
          "LocalStorage - Stockage local des données",
          "JSON - Format d'échange de données"
        ],
        deployment: [
          "Progressive Web App (PWA)",
          "Responsive Design",
          "Dark/Light Mode"
        ]
      },
      features: {
        title: "Fonctionnalités",
        dashboard: {
          name: "Tableau de bord",
          description: "Vue d'ensemble de l'activité quotidienne avec analytics avancées",
          features: [
            "Statistiques en temps réel avec indicateurs de tendance",
            "Chiffre d'affaires journalier et comparaisons périodiques", 
            "Valeur du stock avec alertes intelligentes",
            "Personnel actif avec suivi de performance",
            "Alertes de stock bas automatisées",
            "Actions rapides contextuelles",
            "Navigation intuitive avec skeleton loading",
            "Dashboard optimisé avec cache intelligent",
            "Micro-interactions pour l'engagement utilisateur",
            "Mode hors ligne avec synchronisation",
            "Notifications push intégrées",
            "Analytics prédictives en temps réel"
          ]
        },
        inventory: {
          name: "Gestion du stock",
          description: "Suivi complet de l'inventaire avec fonctionnalités avancées",
          features: [
            "Ajout/modification/suppression d'articles",
            "Catégorisation hiérarchique des produits",
            "Gestion des seuils d'alerte intelligents",
            "Historique optimisé des réapprovisionnements",
            "Déduplication avancée des entrées",
            "Calcul automatique des bénéfices et marges",
            "Import/Export des données enrichi",
            "Recherche et filtrage multi-critères",
            "Vue en liste et grille adaptative",
            "Notifications de stock bas automatiques",
            "Gestion des contenants et unités",
            "Suivi des prix d'achat et de vente",
            "Rapports de valorisation du stock",
            "Mode hors ligne avec synchronisation"
          ]
        },
        sales: {
          name: "Gestion des ventes",
          description: "Enregistrement et suivi complet des transactions commerciales",
          features: [
            "Enregistrement de ventes individuelles et multiples",
            "Gestion intelligente des tables avec statuts",
            "Attribution automatique aux vendeurs",
            "Historique détaillé des transactions",
            "Statistiques en temps réel avancées",
            "Calcul automatique des profits et marges",
            "Gestion des commandes par table optimisée",
            "Notifications de ventes importantes",
            "Rapports de performance par vendeur",
            "Analyse des tendances de vente avec IA",
            "Gestion des remises et promotions",
            "Impression de tickets avec QR codes",
            "Mode rapide pour rush optimisé",
            "Annulation de ventes avec traçabilité complète",
            "Système de cash flow intégré",
            "Analytics prédictives des ventes"
          ]
        },
        staff: {
          name: "Gestion du personnel",
          description: "Administration de l'équipe",
          features: [
            "Profils du personnel complets",
            "Gestion des rôles et permissions avancée",
            "Suivi de l'activité en temps réel",
            "Statut actif/inactif avec historique",
            "Informations de contact sécurisées",
            "Performance individuelle avec analytics",
            "Gestion des horaires et planning",
            "Système de notifications personnalisées",
            "Rapports de productivité détaillés",
            "Formation et certifications"
          ]
        },
        reports: {
          name: "Rapports et analyses",
          description: "Système d'analytics avancé avec IA et prédictions",
          features: [
            "Analytics consolidées avec KPIs intelligents",
            "Graphiques de ventes interactifs avec TradingChart",
            "Analyses temporelles avancées multi-périodes",
            "Rapports de stock en temps réel avec prédictions",
            "Performance du personnel détaillée avec analytics",
            "Export des données multi-formats (Excel, JSON, PDF)",
            "Statistiques avancées avec IA prédictive",
            "Tableaux de bord personnalisables et interactifs",
            "Comparaisons de périodes avec insights automatiques",
            "Analyses de profitabilité par produit et catégorie",
            "Prédictions de stock avec algorithmes ML",
            "Alertes intelligentes automatisées par contexte",
            "Rapports comptables exportables avec conformité",
            "Centre d'alertes intelligentes avec notifications push",
            "Analytics des notifications avec engagement tracking",
            "Système d'export comptable automatisé",
            "Filtres de date avancés avec présets intelligents",
            "Analyses de cash flow avec projections"
          ]
        },
        settings: {
          name: "Paramètres",
          description: "Configuration avancée avec optimisations de performance",
          features: [
            "Informations de l'établissement complètes avec géolocalisation",
            "Thème et apparence personnalisables (Dark/Light mode)",
            "Notifications intelligentes configurables par contexte",
            "Gestion des données avancée avec compression",
            "Export/Import complet avec validation et intégrité",
            "Zone de danger avec sauvegarde sécurisée",
            "Paramètres de performance avec optimisations automatiques",
            "Configuration des alertes automatiques par seuils",
            "Gestion des sauvegardes automatiques programmées",
            "Paramètres de sécurité avancés avec audit trail",
            "Générateur de cahier des charges automatique",
            "Informations de version avec changelog",
            "Optimiseur de performance en temps réel",
            "Gestion des permissions utilisateur avancée",
            "Configuration PWA avec installation automatique",
            "Paramètres d'accessibilité complets"
          ]
        },
        cash: {
          name: "Gestion de la caisse",
          description: "Système complet de gestion du cash flow",
          features: [
            "Suivi du solde de caisse en temps réel",
            "Historique des transactions de caisse",
            "Rapports de caisse quotidiens automatiques",
            "Gestion des entrées et sorties d'argent",
            "Réconciliation automatique avec les ventes",
            "Notifications d'écarts de caisse",
            "Export des données de caisse",
            "Analytics de cash flow avec prédictions"
          ]
        },
        tables: {
          name: "Gestion des tables",
          description: "Système avancé de gestion des tables avec statuts intelligents",
          features: [
            "Gestion des tables avec statuts dynamiques",
            "Vues en temps réel des tables occupées/libres",
            "Attribution automatique des serveurs aux tables",
            "Historique des commandes par table",
            "Calculs automatiques des balances",
            "Notifications de statut de table",
            "Analytics de rotation des tables",
            "Optimisation de l'occupation des tables"
          ]
        },
        notifications: {
          name: "Centre de notifications",
          description: "Système de notifications intelligent et contextuel",
          features: [
            "Centre de notifications unifié et moderne",
            "Notifications contextuelles par module",
            "Système de toasts empilables avec animations",
            "Notifications push intelligentes",
            "Alertes automatiques basées sur des seuils",
            "Historique des notifications avec recherche",
            "Configuration personnalisée par type",
            "Analytics des notifications avec engagement"
          ]
        }
      },
      architecture: {
        title: "Architecture",
        structure: [
          "src/components/ - Composants réutilisables",
          "src/pages/ - Pages principales",
          "src/hooks/ - Hooks personnalisés",
          "src/lib/ - Utilitaires et helpers",
          "src/components/ui/ - Composants UI de base",
          "src/components/settings/ - Composants de paramètres"
        ],
        patterns: [
          "Hooks personnalisés pour la logique métier",
          "Composants fonctionnels avec TypeScript",
          "State management avec React hooks",
          "Stockage local avec LocalStorage",
          "Design responsive mobile-first"
        ]
      },
      userInterface: {
        title: "Interface Utilisateur",
        design: [
          "Design moderne avec mode sombre/clair",
          "Interface responsive (mobile-first)",
          "Navigation par onglets en bas",
          "Animations fluides",
          "Composants Material Design",
          "Thème cohérent avec variables CSS"
        ],
        navigation: [
          "Navigation principale en bas",
          "Header contextuel",
          "Boutons de retour",
          "Actions flottantes",
          "Gestes tactiles"
        ]
      },
      dataManagement: {
        title: "Gestion des Données",
        storage: [
          "Stockage local dans le navigateur",
          "Données au format JSON",
          "Sauvegarde automatique",
          "Export/Import des données",
          "Aucune donnée transmise à des serveurs externes"
        ],
        security: [
          "Données stockées localement",
          "Pas de transmission réseau",
          "Contrôle total de l'utilisateur",
          "Sauvegarde recommandée"
        ]
      },
      deployment: {
        title: "Déploiement",
        requirements: [
          "Navigateur web moderne",
          "JavaScript activé",
          "LocalStorage disponible",
          "Connexion internet pour le chargement initial"
        ],
        compatibility: [
          "Chrome 90+",
          "Firefox 88+",
          "Safari 14+",
          "Edge 90+",
          "Navigateurs mobiles modernes"
        ]
      },
      performance: {
        title: "Performance et Optimisation",
        optimizations: [
          "Lazy loading des composants avec React.lazy",
          "Virtualisation des listes longues avec React Window",
          "Cache intelligent avec stratégies de mise à jour LRU",
          "Compression des données locales avec gzip",
          "Optimisation des re-renders React avec useMemo/useCallback",
          "Bundle splitting automatique avec Vite",
          "Service Worker pour la mise en cache hors ligne",
          "Déduplication des requêtes et calculs optimisée",
          "Skeleton loading pour améliorer la perception UX",
          "Micro-interactions pour l'engagement utilisateur",
          "Optimiseur de performance en temps réel",
          "Cache adaptatif avec éviction intelligente",
          "Préchargement intelligent des données critiques",
          "Optimisation des images avec lazy loading",
          "Compression et minification avancées",
          "Monitoring de performance en temps réel"
        ]
      },
      security: {
        title: "Sécurité et Confidentialité",
        measures: [
          "Stockage local sécurisé",
          "Validation des données côté client",
          "Protection contre les injections XSS",
          "Chiffrement des données sensibles",
          "Audit trail des modifications",
          "Contrôle d'accès par rôles",
          "Sauvegarde automatique sécurisée",
          "Conformité RGPD"
        ]
      },
      accessibility: {
        title: "Accessibilité",
        features: [
          "Support des lecteurs d'écran",
          "Navigation au clavier",
          "Contraste élevé disponible",
          "Tailles de police ajustables",
          "Labels ARIA complets",
          "Focus visible et logique",
          "Support des technologies d'assistance",
          "Conformité WCAG 2.1"
        ]
      },
      futureEnhancements: {
        title: "Améliorations Futures",
        suggestions: [
          "Synchronisation cloud optionnelle",
          "Notifications push intelligentes",
          "Mode hors ligne complet avancé",
          "Intégration avec systèmes de paiement",
          "API REST pour intégrations tierces",
          "Intelligence artificielle pour analyses prédictives",
          "Gestion multi-établissements",
          "Sauvegarde automatique cloud cryptée",
          "Application mobile native",
          "Intégration comptabilité",
          "Système de fidélité client",
          "Reconnaissance vocale pour commandes rapides"
        ]
      },
      support: {
        title: "Support et Contact",
        developer: "Romain Sergio BOGNISSOU",
        email: "romainmahougnon@gmail.com",
        documentation: "Disponible dans l'application",
        updates: "Mises à jour régulières"
      }
    };

    const docContent = `# CAHIER DES CHARGES - ${specification.project.name}

## Informations du Projet
- **Nom**: ${specification.project.name}
- **Version**: ${specification.project.version}
- **Description**: ${specification.project.description}
- **Auteur**: ${specification.project.author}
- **Contact**: ${specification.project.contact}
- **Date**: ${specification.project.date}

## ${specification.overview.title}
${specification.overview.description}

### Objectifs
${specification.overview.objectives.map(obj => `- ${obj}`).join('\n')}

## ${specification.technicalStack.title}

### Frontend
${specification.technicalStack.frontend.map(tech => `- ${tech}`).join('\n')}

### Stockage
${specification.technicalStack.storage.map(storage => `- ${storage}`).join('\n')}

### Déploiement
${specification.technicalStack.deployment.map(deploy => `- ${deploy}`).join('\n')}

## ${specification.features.title}

### ${specification.features.dashboard.name}
${specification.features.dashboard.description}
${specification.features.dashboard.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.inventory.name}
${specification.features.inventory.description}
${specification.features.inventory.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.sales.name}
${specification.features.sales.description}
${specification.features.sales.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.staff.name}
${specification.features.staff.description}
${specification.features.staff.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.reports.name}
${specification.features.reports.description}
${specification.features.reports.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.settings.name}
${specification.features.settings.description}
${specification.features.settings.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.cash.name}
${specification.features.cash.description}
${specification.features.cash.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.tables.name}
${specification.features.tables.description}
${specification.features.tables.features.map(feature => `- ${feature}`).join('\n')}

### ${specification.features.notifications.name}
${specification.features.notifications.description}
${specification.features.notifications.features.map(feature => `- ${feature}`).join('\n')}

## ${specification.architecture.title}

### Structure
${specification.architecture.structure.map(struct => `- ${struct}`).join('\n')}

### Patterns
${specification.architecture.patterns.map(pattern => `- ${pattern}`).join('\n')}

## ${specification.userInterface.title}

### Design
${specification.userInterface.design.map(design => `- ${design}`).join('\n')}

### Navigation
${specification.userInterface.navigation.map(nav => `- ${nav}`).join('\n')}

## ${specification.dataManagement.title}

### Stockage
${specification.dataManagement.storage.map(storage => `- ${storage}`).join('\n')}

### Sécurité
${specification.dataManagement.security.map(security => `- ${security}`).join('\n')}

## ${specification.deployment.title}

### Prérequis
${specification.deployment.requirements.map(req => `- ${req}`).join('\n')}

### Compatibilité
${specification.deployment.compatibility.map(comp => `- ${comp}`).join('\n')}

## ${specification.performance.title}
${specification.performance.optimizations.map(opt => `- ${opt}`).join('\n')}

## ${specification.security.title}
${specification.security.measures.map(measure => `- ${measure}`).join('\n')}

## ${specification.accessibility.title}
${specification.accessibility.features.map(feature => `- ${feature}`).join('\n')}

## ${specification.futureEnhancements.title}
${specification.futureEnhancements.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}

## ${specification.support.title}
- **Développeur**: ${specification.support.developer}
- **Email**: ${specification.support.email}
- **Documentation**: ${specification.support.documentation}
- **Mises à jour**: ${specification.support.updates}

---

*Document généré automatiquement par BarFlowTrack v${specification.project.version}*
*© 2024 ${specification.project.author}*
`;

    const blob = new Blob([docContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BarFlowTrack-Cahier-des-Charges-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "📋 Cahier des charges généré",
      description: "Le document a été téléchargé avec succès.",
    });
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Cahier des charges</CardTitle>
            <CardDescription className="text-sm">Documentation complète de l'application</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Document inclut :</h4>
              <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Vue d'ensemble et objectifs</li>
                <li>• Stack technique détaillé</li>
                <li>• Fonctionnalités complètes</li>
                <li>• Architecture de l'application</li>
                <li>• Interface utilisateur et navigation</li>
                <li>• Gestion des données et sécurité</li>
                <li>• Déploiement et compatibilité</li>
                <li>• Améliorations futures</li>
              </ul>
            </div>
          </div>
          
          <Button onClick={generateSpecification} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Télécharger le cahier des charges
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
