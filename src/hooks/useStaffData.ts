
import React, { useCallback } from 'react';
import { storage, StaffMember } from '@/lib/storage';

export const useStaffData = () => {
  const getStaff = useCallback((): StaffMember[] => {
    return storage.load<StaffMember[]>('staff') || [];
  }, []);

  const saveStaff = useCallback((staff: StaffMember[]) => {
    storage.save('staff', staff);
  }, []);

  const addStaffMember = useCallback((member: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const staff = getStaff();
    const newMember: StaffMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    staff.push(newMember);
    saveStaff(staff);
    window.dispatchEvent(new CustomEvent('staffChanged'));
    return newMember;
  }, [getStaff, saveStaff]);

  const updateStaffMember = useCallback((id: string, updates: Partial<StaffMember>) => {
    const staff = getStaff();
    const index = staff.findIndex(member => member.id === id);
    if (index !== -1) {
      staff[index] = {
        ...staff[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveStaff(staff);
      window.dispatchEvent(new CustomEvent('staffChanged'));
      return staff[index];
    }
    return null;
  }, [getStaff, saveStaff]);

  const deleteStaffMember = useCallback((id: string) => {
    const staff = getStaff();
    const filteredStaff = staff.filter(member => member.id !== id);
    saveStaff(filteredStaff);
    window.dispatchEvent(new CustomEvent('staffChanged'));
  }, [getStaff, saveStaff]);

  return {
    getStaff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
  };
};
