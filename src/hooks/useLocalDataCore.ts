
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLocalDataCore = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user has default tables, create if not
          const { data: tables } = await supabase.from('tables').select('id').eq('user_id', user.id).limit(1);
          if (!tables || tables.length === 0) {
            const defaultTables = [
              { user_id: user.id, name: 'Table 1', capacity: 4, status: 'available', is_active: true },
              { user_id: user.id, name: 'Table 2', capacity: 4, status: 'available', is_active: true },
              { user_id: user.id, name: 'Table 3', capacity: 6, status: 'available', is_active: true },
              { user_id: user.id, name: 'Table 4', capacity: 2, status: 'available', is_active: true },
              { user_id: user.id, name: 'Table 5', capacity: 8, status: 'available', is_active: true },
            ];
            await supabase.from('tables').insert(defaultTables);
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isLoading };
};
