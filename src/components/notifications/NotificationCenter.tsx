import { useState, useMemo } from 'react';
import { Bell, Check, X, AlertCircle, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const getIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />;
    default:
      return <Info className="h-4 w-4 text-info" />;
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-l-destructive bg-destructive/5';
    case 'medium':
      return 'border-l-4 border-l-warning bg-warning/5';
    case 'low':
      return 'border-l-4 border-l-muted bg-muted/50';
    default:
      return 'border-l-4 border-l-border';
  }
};

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleRemove = (id: string) => {
    removeNotification(id);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent transition-colors"
          aria-label="Ouvrir le centre de notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-scale-in"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[440px] p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
              </SheetDescription>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Tout marquer
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Non lues ({unreadCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 m-0 mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Aucune notification pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-2 px-6 pb-6">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        'p-4 transition-all hover:shadow-md',
                        getPriorityStyles(notification.priority),
                        !notification.read && 'bg-accent/30'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold leading-tight">
                              {notification.title}
                            </h4>
                            <div className="flex gap-1 flex-shrink-0">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  aria-label="Marquer comme lu"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => handleRemove(notification.id)}
                                aria-label="Supprimer"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.timestamp), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                            {notification.source && (
                              <Badge variant="outline" className="text-xs">
                                {notification.source}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="flex-1 m-0 mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <CheckCircle className="h-12 w-12 text-success/50 mb-3" />
                  <p className="text-sm font-medium">Toutes les notifications sont lues !</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous êtes à jour
                  </p>
                </div>
              ) : (
                <div className="space-y-2 px-6 pb-6">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        'p-4 transition-all hover:shadow-md',
                        getPriorityStyles(notification.priority),
                        'bg-accent/30'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold leading-tight">
                              {notification.title}
                            </h4>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleMarkAsRead(notification.id)}
                                aria-label="Marquer comme lu"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => handleRemove(notification.id)}
                                aria-label="Supprimer"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.timestamp), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                            {notification.source && (
                              <Badge variant="outline" className="text-xs">
                                {notification.source}
                              </Badge>
                            )}
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
      </SheetContent>
    </Sheet>
  );
};
