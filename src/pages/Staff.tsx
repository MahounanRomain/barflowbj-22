
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import StaffMember, { StaffMemberProps } from "@/components/StaffMember";
import AddStaffDialog from "@/components/AddStaffDialog";
import { useLocalData } from "@/hooks/useLocalData";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";

const StaffContent = () => {
  const { getStaff } = useLocalData();
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState<StaffMemberProps[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const loadStaff = useCallback(() => {
    try {
      const data = getStaff();
      setStaff(data);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error loading staff:", error);
      setIsDataLoaded(true);
    }
  }, [getStaff]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    const handleStaffChange = () => {
      loadStaff();
    };

    window.addEventListener('staffChanged', handleStaffChange);
    return () => window.removeEventListener('staffChanged', handleStaffChange);
  }, [loadStaff]);

  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);

  const filteredStaff = useMemo(() => 
    staff.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [staff, searchTerm]
  );

  if (isSkeletonLoading) {
    return null; // PageWithSkeleton will handle the skeleton display
  }

  return (
    <div className="mobile-container">
      <Header 
        rightContent={<AddStaffDialog />}
      />

      <main className="px-4 py-4 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher dans le personnel..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {staff.length === 0 ? 
                "Aucun employé enregistré. Ajoutez votre premier employé !" :
                "Aucun employé trouvé pour cette recherche."
              }
            </div>
          ) : (
            filteredStaff.map(member => (
              <StaffMember key={member.id} {...member} onClick={() => {}} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const Staff = () => {
  return (
    <PageWithSkeleton>
      <StaffContent />
    </PageWithSkeleton>
  );
};

export default Staff;
