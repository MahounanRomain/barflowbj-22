import React from 'react';
const DashboardWelcome = () => {
  return <div className="text-center space-y-3">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Tableau de bord
      </h1>
      <p className="text-muted-foreground text-sm py-[15px]" style={{ contentVisibility: 'auto' }}>
        Vue d'ensemble de votre activité quotidienne
      </p>
    </div>;
};
export default DashboardWelcome;