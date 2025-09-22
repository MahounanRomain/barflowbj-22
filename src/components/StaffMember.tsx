
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import EditStaffDialog from "./EditStaffDialog";

export interface StaffMemberProps {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const StaffMember: React.FC<StaffMemberProps> = ({
  id,
  name,
  role,
  email,
  phone,
  isActive = true,
  onClick
}) => {
  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-card/80 transition-colors flex items-center gap-3"
      onClick={onClick}
    >
      <Avatar className="h-12 w-12 border border-border">
        <AvatarFallback className="bg-secondary text-foreground">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
              {isActive ? "Actif" : "Inactif"}
            </Badge>
            <EditStaffDialog staffMember={{ id, name, role, email, phone, isActive }} />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{role}</p>
        
        {(email || phone) && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {email || phone}
          </p>
        )}
      </div>
    </Card>
  );
};

export default StaffMember;
