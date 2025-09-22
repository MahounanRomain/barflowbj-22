import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Package, 
  Settings,
  Check,
  Trash2,
  History,
  Filter
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EnhancedNotificationCenter = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    getStats
  } = useNotifications();

  const stats = getStats();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'all' | 'history'>('unread');
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'high_sales' | 'system'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package size={16} className="text-warning" />;
      case 'high_sales': return <TrendingUp size={16} className="text-success" />;
      case 'staff_activity': return <Users size={16} className="text-info" />;
      case 'table_update': return <Bell size={16} className="text-primary" />;
      default: return <AlertTriangle size={16} className="text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive' as const;
      case 'medium': return 'secondary' as const;
      case 'low': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterNotifications = (notifications: any[], tab: string) => {
    let filtered = notifications;

    // Filtrer par onglet
    switch (tab) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'history':
        filtered = filtered.filter(n => n.read);
        break;
      // 'all' ne filtre rien
    }

    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    return filtered;
  };

  const getTabCounts = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    const totalCount = notifications.length;
    const historyCount = notifications.filter(n => n.read).length;
    
    return { unreadCount, totalCount, historyCount };
  };

  const { unreadCount, totalCount, historyCount } = getTabCounts();
  const filteredNotifications = filterNotifications(notifications, activeTab);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative h-9 w-9 rounded-full p-0">
          <Bell size={18} className="text-muted-foreground" />
          {stats.hasUnread && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-1 -right-1 h-4 min-w-4 p-0 text-[10px] font-bold",
                "flex items-center justify-center",
                "border border-background shadow-lg rounded-full",
                stats.hasHighPriority ? "animate-pulse bg-destructive" : "bg-destructive/80"
              )}
            >
              {stats.unreadCount > 9 ? "9+" : stats.unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <DialogTitle className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notifications
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalCount}
                </Badge>
              </DialogTitle>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Filter size={14} className="mr-1" />
                    <span className="text-xs">Type</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filtrer par type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterType('all')}>
                    Toutes les notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('low_stock')}>
                    <Package size={14} className="mr-2" />
                    Stock bas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('high_sales')}>
                    <TrendingUp size={14} className="mr-2" />
                    Ventes élevées
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('system')}>
                    <Settings size={14} className="mr-2" />
                    Système
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-2">
                  <Check size={14} />
                  <span className="text-xs ml-1 hidden sm:inline">Tout lire</span>
                  <span className="text-xs ml-1 sm:hidden">✓</span>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unread" className="text-xs">
                Non lues {unreadCount > 0 && <Badge variant="secondary" className="ml-1 text-xs">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                Historique {historyCount > 0 && <Badge variant="outline" className="ml-1 text-xs">{historyCount}</Badge>}
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <TabsContent value="unread" className="space-y-3 mt-0">
                  <NotificationsList 
                    notifications={filteredNotifications}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getIcon}
                    getPriorityColor={getPriorityColor}
                    getPriorityBadgeVariant={getPriorityBadgeVariant}
                    formatTimestamp={formatTimestamp}
                    showActions={true}
                  />
                </TabsContent>

                <TabsContent value="all" className="space-y-3 mt-0">
                  <NotificationsList 
                    notifications={filteredNotifications}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getIcon}
                    getPriorityColor={getPriorityColor}
                    getPriorityBadgeVariant={getPriorityBadgeVariant}
                    formatTimestamp={formatTimestamp}
                    showActions={true}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-3 mt-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">
                      {historyCount} notification(s) lue(s)
                    </span>
                    {historyCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => clearReadNotifications('')}
                        className="text-xs"
                      >
                        <Trash2 size={12} className="mr-1" />
                        Vider l'historique
                      </Button>
                    )}
                  </div>
                  <NotificationsList 
                    notifications={filteredNotifications}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getIcon}
                    getPriorityColor={getPriorityColor}
                    getPriorityBadgeVariant={getPriorityBadgeVariant}
                    formatTimestamp={formatTimestamp}
                    showActions={false}
                    showReadStatus={true}
                  />
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface NotificationsListProps {
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getIcon: (type: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  getPriorityBadgeVariant: (priority: string) => "default" | "secondary" | "destructive" | "outline";
  formatTimestamp: (timestamp: string) => string;
  showActions?: boolean;
  showReadStatus?: boolean;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  getIcon,
  getPriorityColor,
  getPriorityBadgeVariant,
  formatTimestamp,
  showActions = false,
  showReadStatus = false
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell size={48} className="mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground font-medium">
          Aucune notification
        </p>
        <p className="text-sm text-muted-foreground/70">
          Vous êtes à jour !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <Card 
          key={notification.id}
          className={cn(
            "p-4 transition-all duration-200",
            !notification.read && "bg-primary/5 border-primary/20",
            notification.priority === 'high' && !notification.read && "border-destructive/30 bg-destructive/5",
            showActions && "hover:shadow-md cursor-pointer"
          )}
          onClick={showActions && !notification.read ? () => onMarkAsRead(notification.id) : undefined}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge 
                    variant={getPriorityBadgeVariant(notification.priority)}
                    className={cn("text-xs", getPriorityColor(notification.priority))}
                  >
                    {notification.priority}
                  </Badge>
                  {showReadStatus && notification.read && (
                    <Badge variant="outline" className="text-xs">
                      <Check size={10} className="mr-1" />
                      Lu
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                {notification.message}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground/70">
                  {formatTimestamp(notification.timestamp)}
                  {showReadStatus && notification.readAt && (
                    <span className="ml-2">
                      • Lu {formatTimestamp(notification.readAt)}
                    </span>
                  )}
                </span>
                
                {showActions && (
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Check size={12} className="mr-1" />
                        Marquer lu
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedNotificationCenter;