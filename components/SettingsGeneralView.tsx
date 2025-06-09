import React from 'react';
import { APP_NAME } from '../constants';
import { 
  BuildingOfficeIcon, 
  KeyIcon, 
  InformationCircleIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CircleStackIcon,
  EnvelopeIcon,
  MapPinIcon
} from './icons/OutlineIcons';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactElement<{ className?: string }>; // Updated type
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
  <div className="bg-brand-surface shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-4">
      {React.cloneElement(icon, { className: 'w-7 h-7 text-brand-primary mr-3' })}
      <h3 className="text-xl font-semibold text-brand-primary">{title}</h3>
    </div>
    <div className="text-brand-text-muted space-y-3 text-sm">
      {children}
    </div>
  </div>
);

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactElement<{ className?: string }>; // Updated type
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
    <div className="flex items-center py-2 border-b border-brand-border last:border-b-0">
        {icon && React.cloneElement(icon, { className: "w-5 h-5 mr-3 text-brand-primary-light flex-shrink-0"})}
        <span className="font-medium text-brand-text-main w-1/3">{label}:</span>
        <span className="text-brand-text-muted w-2/3">{value}</span>
    </div>
);


export const SettingsGeneralView: React.FC = () => {
  const appVersion = "1.2.0"; // Fictional version number
  const companyCVR = "DK-12345678";
  const companyAddress = "Rengøringsvej 1, 8000 Aarhus C";
  const companyEmail = "info@rendetalje.dk";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SettingsSection title="Virksomhedsinformation" icon={<BuildingOfficeIcon />}>
        <InfoRow label="Applikationsnavn" value={APP_NAME} icon={<InformationCircleIcon />} />
        <InfoRow label="CVR-nummer" value={companyCVR} />
        <InfoRow label="Adresse" value={companyAddress} icon={<MapPinIcon />} />
        <InfoRow label="Kontakt Email" value={companyEmail} icon={<EnvelopeIcon />} />
        <p className="mt-3 text-xs italic">
          Disse oplysninger er faste og kan ikke ændres her.
        </p>
      </SettingsSection>

      <SettingsSection title="API Nøgle Status" icon={<KeyIcon />}>
        <p>
          Systemet anvender eksterne API'er (f.eks. til avancerede funktioner).
          En gyldig API nøgle forventes at være konfigureret sikkert i applikationens servermiljø.
        </p>
        <p className="mt-2 p-3 bg-brand-info/10 text-brand-info rounded-md text-xs">
          <strong>Bemærk:</strong> API nøglen administreres ikke via denne brugerflade af sikkerhedsmæssige årsager.
        </p>
      </SettingsSection>

      <SettingsSection title="Meddelelsesindstillinger" icon={<ChatBubbleBottomCenterTextIcon />}>
        <p>
          Indstillinger for e-mail og SMS notifikationer vil være tilgængelige her i en fremtidig opdatering.
        </p>
        <p className="mt-2 text-brand-primary-dark font-medium text-xs">Kommer snart!</p>
      </SettingsSection>
      
      <SettingsSection title="Datahåndtering" icon={<CircleStackIcon />}>
        <p>
          Funktioner for eksport og import af data (f.eks. kunder, opgaver) vil blive tilføjet her.
        </p>
         <p className="mt-2 text-brand-primary-dark font-medium text-xs">Kommer snart!</p>
      </SettingsSection>

      <SettingsSection title="Applikationsversion" icon={<InformationCircleIcon />}>
        <p>Du kører i øjeblikket version <strong className="text-brand-text-main">{appVersion}</strong> af {APP_NAME}.</p>
         <p className="mt-2 text-xs">Vi arbejder løbende på at forbedre systemet. Hold øje med nye opdateringer!</p>
      </SettingsSection>
    </div>
  );
};
