
// Utilitaires pour la gestion cohérente des dates
export const formatDateForStorage = (date: Date): string => {
  // Utiliser toISOString().split('T')[0] pour s'assurer que nous avons la date locale correcte
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = (): string => {
  return formatDateForStorage(new Date());
};

export const formatDateFromString = (dateString: string): Date => {
  // Créer une date en mode local plutôt qu'UTC pour éviter les décalages
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export const isSameDate = (date1: Date | string, date2: Date | string): boolean => {
  const dateStr1 = typeof date1 === 'string' ? date1 : formatDateForStorage(date1);
  const dateStr2 = typeof date2 === 'string' ? date2 : formatDateForStorage(date2);
  return dateStr1 === dateStr2;
};

export const formatDisplayDate = (dateString: string): string => {
  const date = formatDateFromString(dateString);
  return date.toLocaleDateString('fr-FR');
};
