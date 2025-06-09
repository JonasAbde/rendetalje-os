import React from 'react';

interface ReportsOverviewViewProps {
  // Tilføj props her hvis nødvendigt
}

export const ReportsOverviewView: React.FC<ReportsOverviewViewProps> = () => {
  return (
    <div className="reports-overview">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Rapporter</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Månedlig oversigt */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Månedlig oversigt</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Omsætning</p>
              <p>• Antal opgaver</p>
              <p>• Gennemsnitlig opgavestørrelse</p>
            </div>
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Se rapport →
            </button>
          </div>

          {/* Medarbejder rapport */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Medarbejder rapport</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Timer per medarbejder</p>
              <p>• Produktivitet</p>
              <p>• Opgavefordeling</p>
            </div>
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Se rapport →
            </button>
          </div>

          {/* Kunde rapport */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Kunde rapport</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Top kunder</p>
              <p>• Kundeværdi</p>
              <p>• Tilfredshed</p>
            </div>
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Se rapport →
            </button>
          </div>

          {/* Økonomi rapport */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Økonomi</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Indtægter vs udgifter</p>
              <p>• Overskudsgrad</p>
              <p>• Cashflow</p>
            </div>
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Se rapport →
            </button>
          </div>

          {/* Lager rapport */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Lager status</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Varebeholdning</p>
              <p>• Forbrugsvarer</p>
              <p>• Bestillingsbehov</p>
            </div>
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Se rapport →
            </button>
          </div>

          {/* Eksporter data */}
          <div className="bg-gray-50 rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-semibold mb-4">Eksporter data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download rapporter i forskellige formater
            </p>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Eksporter til Excel
              </button>
              <button className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                Eksporter til PDF
              </button>
            </div>
          </div>
        </div>

        {/* Hurtig statistik */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Hurtig statistik (denne måned)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">42</p>
              <p className="text-sm text-gray-600">Opgaver udført</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">87%</p>
              <p className="text-sm text-gray-600">Kundetilfredshed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">156</p>
              <p className="text-sm text-gray-600">Timer registreret</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">kr 125k</p>
              <p className="text-sm text-gray-600">Omsætning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 