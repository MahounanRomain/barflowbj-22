import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger, type LogEntry, type LogLevel } from '@/lib/errorLogger';
import { Download, Trash2, RefreshCw, AlertTriangle, Info, Bug, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LogLevelIcon = ({ level }: { level: LogLevel }) => {
  switch (level) {
    case 'critical':
      return <Zap className="h-4 w-4 text-red-600" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'debug':
      return <Bug className="h-4 w-4 text-gray-500" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const LogLevelBadge = ({ level }: { level: LogLevel }) => {
  const colors = {
    critical: 'bg-red-600 text-white',
    error: 'bg-red-500 text-white',
    warn: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    debug: 'bg-gray-500 text-white',
  };

  return (
    <Badge className={colors[level] || colors.info}>
      <LogLevelIcon level={level} />
      <span className="ml-1 capitalize">{level}</span>
    </Badge>
  );
};

const LogEntry = ({ log }: { log: LogEntry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogLevelBadge level={log.level} />
          <span className="text-sm font-medium">{log.message}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleString()}
        </div>
      </div>

      {(log.data || log.stack) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs"
        >
          {isExpanded ? 'Masquer' : 'Voir'} les détails
        </Button>
      )}

      {isExpanded && (
        <div className="space-y-2 text-xs">
          {log.data && (
            <div>
              <strong>Données :</strong>
              <pre className="mt-1 p-2 bg-muted rounded overflow-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          )}
          {log.stack && (
            <div>
              <strong>Stack trace :</strong>
              <pre className="mt-1 p-2 bg-muted rounded overflow-auto text-xs">
                {log.stack}
              </pre>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-muted-foreground">
            <div>
              <strong>URL :</strong> {log.url}
            </div>
            <div>
              <strong>Session :</strong> {log.sessionId}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ErrorDebugPanel = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');

  const refreshLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs);
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    toast({
      title: "Logs supprimés",
      description: "Tous les logs ont été supprimés.",
    });
  };

  const exportLogs = () => {
    const logsData = logger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Logs exportés",
      description: "Les logs ont été téléchargés.",
    });
  };

  React.useEffect(() => {
    refreshLogs();
  }, []);

  const filteredLogs = selectedLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === selectedLevel);

  const logCounts = {
    all: logs.length,
    critical: logs.filter(l => l.level === 'critical').length,
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length,
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Panneau de débogage des erreurs
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={refreshLogs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={clearLogs}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as LogLevel | 'all')}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              Tous ({logCounts.all})
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              Critical ({logCounts.critical})
            </TabsTrigger>
            <TabsTrigger value="error" className="text-xs">
              Error ({logCounts.error})
            </TabsTrigger>
            <TabsTrigger value="warn" className="text-xs">
              Warn ({logCounts.warn})
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs">
              Info ({logCounts.info})
            </TabsTrigger>
            <TabsTrigger value="debug" className="text-xs">
              Debug ({logCounts.debug})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLevel} className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Aucun log {selectedLevel !== 'all' && `de niveau ${selectedLevel}`} trouvé.
                  </div>
                ) : (
                  filteredLogs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(log => (
                      <LogEntry key={log.id} log={log} />
                    ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};