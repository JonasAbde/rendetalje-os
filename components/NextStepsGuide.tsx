import React from 'react';

export const NextStepsGuide: React.FC = () => {
  return (
    <div className="p-6 bg-brand-surface rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-brand-primary mb-3">Velkommen til {APP_NAME}!</h2>
      <p className="text-brand-text-main mb-2">
        Dette er din guide til at komme godt i gang med systemet. Vi er glade for at have dig ombord!
      </p>
      <div className="mt-4 space-y-3">
        <div className="p-4 bg-brand-primary-light/30 rounded-lg">
            <h3 className="font-medium text-brand-primary-dark">Udforsk Dashboardet</h3>
            <p className="text-sm text-brand-text-muted">Få et hurtigt overblik over dine kunder, opgaver og bookinger.</p>
        </div>
        <div className="p-4 bg-brand-primary-light/30 rounded-lg">
            <h3 className="font-medium text-brand-primary-dark">Opret din første kunde</h3>
            <p className="text-sm text-brand-text-muted">Gå til "Opret Kunde" i menuen for at tilføje nye kunder.</p>
        </div>
        <div className="p-4 bg-brand-primary-light/30 rounded-lg">
            <h3 className="font-medium text-brand-primary-dark">Planlæg Opgaver</h3>
            <p className="text-sm text-brand-text-muted">Under "Planlægning" kan du se og oprette nye rengøringsopgaver.</p>
        </div>
      </div>
      <p className="text-xs text-brand-text-muted mt-6 text-center">
        Flere funktioner og detaljerede guides vil blive tilføjet løbende.
      </p>
    </div>
  );
};

// Du skal importere APP_NAME hvis du vil bruge den, f.eks. fra ../constants
// import { APP_NAME } from '../constants';
// For nuværende er den hardcodet, men det er bedre at importere den.
const APP_NAME = "Rendetalje"; // Midlertidig, indtil import er på plads.
