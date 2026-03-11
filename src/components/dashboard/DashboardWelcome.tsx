import React from 'react';

const DashboardWelcome = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {getGreeting()} 👋
      </h2>
      <p className="text-muted-foreground text-sm">
        Voici le résumé de votre activité du jour
      </p>
    </div>
  );
};

export default DashboardWelcome;
