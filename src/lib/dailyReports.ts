
import { generateDailyReport } from './excelExport';
import { storage } from './storage';

// Interface pour suivre les rapports générés
interface DailyReportLog {
  date: string;
  generated: boolean;
  fileName: string;
}

// Fonction pour vérifier si un rapport quotidien doit être généré
export const checkAndGenerateDailyReport = () => {
  const today = new Date().toISOString().split('T')[0];
  const reportLogs = storage.load<DailyReportLog[]>('daily_reports_log') || [];
  
  // Vérifier si un rapport a déjà été généré aujourd'hui
  const todayReport = reportLogs.find(log => log.date === today);
  
  if (!todayReport) {
    try {
      // Générer le rapport quotidien
      const fileName = generateDailyReport();
      
      // Enregistrer dans le log
      const newLog: DailyReportLog = {
        date: today,
        generated: true,
        fileName
      };
      
      reportLogs.push(newLog);
      storage.save('daily_reports_log', reportLogs);
      
      console.log(`Rapport quotidien généré: ${fileName}`);
      return fileName;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport quotidien:', error);
      return null;
    }
  }
  
  return null;
};

// Fonction pour obtenir l'historique des rapports
export const getDailyReportsHistory = (): DailyReportLog[] => {
  return storage.load<DailyReportLog[]>('daily_reports_log') || [];
};

// Fonction pour nettoyer les anciens logs (garder seulement les 30 derniers jours)
export const cleanOldReportLogs = () => {
  const reportLogs = storage.load<DailyReportLog[]>('daily_reports_log') || [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filteredLogs = reportLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= thirtyDaysAgo;
  });
  
  storage.save('daily_reports_log', filteredLogs);
};
