import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationAnalytics = () => {
  const { notifications, getStats } = useNotifications();

  const getNotificationsByType = () => {
    const types = ['low_stock', 'high_sales', 'system', 'table_update'];
    return types.map(type => ({
      type,
      count: notifications.filter(n => n.type === type).length,
      unreadCount: notifications.filter(n => n.type === type && !n.read).length
    }));
  };

  const getNotificationsByPriority = () => {
    const priorities = ['high', 'medium', 'low'];
    return priorities.map(priority => ({
      priority,
      count: notifications.filter(n => n.priority === priority).length,
      unreadCount: notifications.filter(n => n.priority === priority && !n.read).length
    }));
  };

  const getRecentActivity = () => {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(n => new Date(n.timestamp) > last24h).length;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle size={16} className="text-warning" />;
      case 'high_sales': return <TrendingUp size={16} className="text-success" />;
      case 'system': return <Bell size={16} className="text-info" />;
      case 'table_update': return <Clock size={16} className="text-primary" />;
      default: return <Bell size={16} className="text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Stock bas';
      case 'high_sales': return 'Ventes élevées';
      case 'system': return 'Système';
      case 'table_update': return 'Tables';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-muted-foreground bg-muted/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const typeStats = getNotificationsByType();
  const priorityStats = getNotificationsByPriority();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Statistiques des Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{getStats().totalCount}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{getStats().unreadCount}</div>
              <div className="text-sm text-muted-foreground">Non lues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{getStats().highPriorityCount}</div>
              <div className="text-sm text-muted-foreground">Priorité haute</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{recentActivity}</div>
              <div className="text-sm text-muted-foreground">Dernières 24h</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Par Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {typeStats.map(({ type, count, unreadCount }) => (
                <div key={type} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(type)}
                    <span className="font-medium">{getTypeLabel(type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{count}</Badge>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount} non lues
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Par Priorité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityStats.map(({ priority, count, unreadCount }) => (
                <div key={priority} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      priority === 'high' && "bg-destructive",
                      priority === 'medium' && "bg-warning",
                      priority === 'low' && "bg-muted-foreground"
                    )} />
                    <span className="font-medium capitalize">{priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{count}</Badge>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount} non lues
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5)
                .map(notification => (
                  <div key={notification.id} className="flex items-center justify-between p-2 border-l-2 border-l-primary/20 pl-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(notification.type)}
                      <div>
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationAnalytics;