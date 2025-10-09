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
      
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] sm:max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b shrink-0">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-semibold">Notifications</h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                  {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
                </p>
              </div>
            </DialogTitle>
            
            {notifications.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 shrink-0">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="gap-1.5 text-xs sm:text-sm h-8"
                  >
                    <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Tout marquer lu</span>
                    <span className="sm:hidden">Marquer</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAll}
                  className="gap-1.5 text-xs sm:text-sm h-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tout effacer</span>
                  <span className="sm:hidden">Effacer</span>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b px-3 sm:px-6 shrink-0">
            <TabsTrigger value="all" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              Toutes
              <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1.5">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              Non lues
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0 flex-1 min-h-0">
            <ScrollArea className="h-full max-h-[calc(90vh-200px)] sm:max-h-[calc(85vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 text-center">
                  <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-muted-foreground mb-1 sm:mb-2">
                    {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground/70">
                    {activeTab === 'unread' 
                      ? 'Vous êtes à jour !' 
                      : 'Les notifications apparaîtront ici'}
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        "p-3 sm:p-4 border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer touch-feedback",
                        getPriorityColor(notification.priority),
                        !notification.read && "bg-accent/50"
                      )}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-0.5 shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                              {notification.title}
                            </h4>
                            {notification.priority === 'high' && (
                              <Badge variant="destructive" className="text-[10px] sm:text-xs shrink-0 h-4 sm:h-5">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-1.5 sm:mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground/70 flex-wrap">
                              <span className="whitespace-nowrap">{formatTimestamp(notification.timestamp)}</span>
                              {notification.source && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="capitalize whitespace-nowrap hidden sm:inline">{notification.source}</span>
                                </>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-destructive/10 hover:text-destructive shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
