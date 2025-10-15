import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, X, CheckCheck, Trash2, Package, ShoppingCart, TrendingUp, AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'info':
        return <Info className="w-4 h-4 text-info" />;
      case 'inventory':
        return <Package className="w-4 h-4 text-primary" />;
      case 'sales':
        return <ShoppingCart className="w-4 h-4 text-success" />;
      case 'system':
        return <TrendingUp className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive bg-destructive/5';
      case 'medium':
        return 'border-l-warning bg-warning/5';
      case 'low':
        return 'border-l-primary bg-primary/5';
      default:
        return 'border-l-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-accent"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] p-0 flex flex-col gap-0 rounded-2xl border-2">
        <DialogHeader className="p-4 pb-3 border-b bg-gradient-to-br from-background via-background to-primary/5 shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shrink-0 shadow-sm">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Notifications
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune notification non lue'}
                </p>
              </div>
            </DialogTitle>
            
            {notifications.length > 0 && (
              <div className="flex gap-2 shrink-0">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="gap-2 h-9 px-3 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Marquer tout</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAll}
                  className="gap-2 h-9 px-3 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Effacer</span>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b px-4 shrink-0 h-12 bg-muted/30">
            <TabsTrigger value="all" className="gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Toutes
              <Badge variant="secondary" className="text-xs h-5 px-2 font-semibold">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Non lues
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs h-5 px-2 font-semibold">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0 flex-1 min-h-0">
            <ScrollArea className="h-full max-h-[calc(85vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                    <Bell className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {activeTab === 'unread' 
                      ? 'Vous êtes à jour ! Toutes vos notifications ont été lues.' 
                      : 'Les notifications apparaîtront ici au fur et à mesure.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        "p-4 border-l-4 transition-all duration-300 hover:shadow-lg cursor-pointer group",
                        getPriorityColor(notification.priority),
                        !notification.read && "bg-gradient-to-r from-accent/30 via-accent/20 to-transparent border-primary/50"
                      )}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 shrink-0 p-2 rounded-lg bg-background/80 shadow-sm">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                              {notification.title}
                            </h4>
                            {notification.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs shrink-0 h-5 font-bold animate-pulse">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
                              <span>{formatTimestamp(notification.timestamp)}</span>
                              {notification.source && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{notification.source}</span>
                                </>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
