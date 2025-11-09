import { useState, useMemo, useCallback } from 'react';
import { Bell, Check, X, AlertCircle, Info, AlertTriangle, CheckCircle, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    markMultipleAsRead,
    removeMultiple,
    isLoading 
  } = useNotifications();

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.source?.toLowerCase().includes(query)
      );
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }
    
    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }
    
    return filtered;
  }, [notifications, activeTab, searchQuery, filterType, filterPriority]);

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead(id);
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  }, [markAsRead]);

  const handleRemove = useCallback((id: string) => {
    removeNotification(id);
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  }, [removeNotification]);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(filteredNotifications.map(n => n.id));
  }, [filteredNotifications]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleMarkSelectedAsRead = useCallback(() => {
    if (selectedIds.length > 0) {
      markMultipleAsRead(selectedIds);
      setSelectedIds([]);
      setSelectionMode(false);
    }
  }, [selectedIds, markMultipleAsRead]);

  const handleRemoveSelected = useCallback(() => {
    if (selectedIds.length > 0) {
      removeMultiple(selectedIds);
      setSelectedIds([]);
      setSelectionMode(false);
    }
  }, [selectedIds, removeMultiple]);

  const hasActiveFilters = searchQuery.trim() !== '' || filterType !== 'all' || filterPriority !== 'all';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterType('all');
    setFilterPriority('all');
  }, []);

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
        <SheetHeader className="px-6 py-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
              </SheetDescription>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {!selectionMode ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectionMode(true)}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Sélection
                    </Button>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={isLoading}
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
                      disabled={isLoading}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Effacer
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectionMode(false);
                        setSelectedIds([]);
                      }}
                      className="text-xs"
                    >
                      Annuler
                    </Button>
                    {selectedIds.length > 0 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkSelectedAsRead}
                          disabled={isLoading}
                          className="text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Marquer ({selectedIds.length})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveSelected}
                          disabled={isLoading}
                          className="text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer ({selectedIds.length})
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="warning">Avertissements</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="inventory">Inventaire</SelectItem>
                  <SelectItem value="sales">Ventes</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {selectionMode && filteredNotifications.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Button
                variant="link"
                size="sm"
                onClick={handleSelectAll}
                className="h-auto p-0 text-xs"
              >
                Tout sélectionner
              </Button>
              {selectedIds.length > 0 && (
                <>
                  <span>•</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-auto p-0 text-xs"
                  >
                    Tout désélectionner
                  </Button>
                  <span>•</span>
                  <span>{selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          )}
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
                        !notification.read && 'bg-accent/30',
                        selectionMode && 'cursor-pointer',
                        selectedIds.includes(notification.id) && 'ring-2 ring-primary'
                      )}
                      onClick={() => selectionMode && handleToggleSelection(notification.id)}
                    >
                      <div className="flex gap-3">
                        {selectionMode && (
                          <div className="flex-shrink-0 mt-0.5">
                            <Checkbox
                              checked={selectedIds.includes(notification.id)}
                              onCheckedChange={() => handleToggleSelection(notification.id)}
                            />
                          </div>
                        )}
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold leading-tight">
                              {notification.title}
                            </h4>
                            {!selectionMode && (
                              <div className="flex gap-1 flex-shrink-0">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                    aria-label="Marquer comme lu"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(notification.id);
                                  }}
                                  aria-label="Supprimer"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
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
                        'bg-accent/30',
                        selectionMode && 'cursor-pointer',
                        selectedIds.includes(notification.id) && 'ring-2 ring-primary'
                      )}
                      onClick={() => selectionMode && handleToggleSelection(notification.id)}
                    >
                      <div className="flex gap-3">
                        {selectionMode && (
                          <div className="flex-shrink-0 mt-0.5">
                            <Checkbox
                              checked={selectedIds.includes(notification.id)}
                              onCheckedChange={() => handleToggleSelection(notification.id)}
                            />
                          </div>
                        )}
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold leading-tight">
                              {notification.title}
                            </h4>
                            {!selectionMode && (
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  aria-label="Marquer comme lu"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(notification.id);
                                  }}
                                  aria-label="Supprimer"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
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

export { NotificationCenter };
export default NotificationCenter;
