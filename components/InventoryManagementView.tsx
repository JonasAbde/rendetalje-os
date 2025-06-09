import React, { useState } from 'react';
import { useInventoryManagement } from '../hooks/useSupabase';
import { InventoryItem } from '../types';
import {
  PlusCircleIcon,
  ArrowPathIcon,
  BellAlertIcon,
  MagnifyingGlassIcon,
  CircleStackIcon,
  XMarkIcon,
} from './icons/OutlineIcons';

interface InventoryManagementViewProps {
  showSuccessMessage: (message: string) => void;
}

const AddItemModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (data: any) => void; }> = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    item_name: '',
    category: 'cleaning_supplies',
    description: '',
    current_stock: 0,
    minimum_stock: 0,
    unit: '',
    cost_per_unit: 0,
    supplier: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name.includes('stock') || name === 'cost_per_unit' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-secondary bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tilføj Ny Vare</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-error/10">
            <XMarkIcon className="w-6 h-6 text-brand-text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Navn</label>
            <input name="item_name" value={form.item_name} onChange={handleChange} required className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface">
              <option value="cleaning_supplies">Rengøringsmidler</option>
              <option value="equipment">Udstyr</option>
              <option value="consumables">Forbrug</option>
              <option value="other">Andet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Beskrivelse</label>
            <input name="description" value={form.description} onChange={handleChange} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Lager</label>
              <input type="number" name="current_stock" value={form.current_stock} onChange={handleChange} required className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimum</label>
              <input type="number" name="minimum_stock" value={form.minimum_stock} onChange={handleChange} required className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Enhed</label>
              <input name="unit" value={form.unit} onChange={handleChange} required className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pris pr. enhed</label>
              <input type="number" name="cost_per_unit" value={form.cost_per_unit} onChange={handleChange} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Leverandør</label>
            <input name="supplier" value={form.supplier} onChange={handleChange} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div className="text-right">
            <button type="submit" className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-medium py-2 px-4 rounded-md">
              Gem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RestockModal: React.FC<{ item: InventoryItem | null; onClose: () => void; onSubmit: (qty: number, cost?: number, notes?: string) => void; }> = ({ item, onClose, onSubmit }) => {
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(qty, cost ? Number(cost) : undefined, notes);
  };

  return (
    <div className="fixed inset-0 bg-brand-secondary bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Genopfyld {item.item_name}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-error/10">
            <XMarkIcon className="w-6 h-6 text-brand-text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Antal</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} required className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pris pr. enhed (valgfri)</label>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Noter (valgfri)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div className="text-right">
            <button type="submit" className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-medium py-2 px-4 rounded-md">Gem</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsageModal: React.FC<{ item: InventoryItem | null; onClose: () => void; onSubmit: (qty: number, taskId?: string, notes?: string) => void; }> = ({ item, onClose, onSubmit }) => {
  const [qty, setQty] = useState(1);
  const [taskId, setTaskId] = useState('');
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(qty, taskId || undefined, notes);
  };

  return (
    <div className="fixed inset-0 bg-brand-secondary bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Registrer forbrug af {item.item_name}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-error/10">
            <XMarkIcon className="w-6 h-6 text-brand-text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Antal</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} required className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opgave ID (valgfri)</label>
            <input value={taskId} onChange={e => setTaskId(e.target.value)} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Noter (valgfri)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-brand-input-border rounded-md p-2 bg-brand-surface" />
          </div>
          <div className="text-right">
            <button type="submit" className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-medium py-2 px-4 rounded-md">Gem</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const InventoryManagementView: React.FC<InventoryManagementViewProps> = ({ showSuccessMessage }) => {
  const { items, transactions, alerts, loading, error, restockItem, recordUsage, addInventoryItem, refetch } = useInventoryManagement();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [restockItemTarget, setRestockItemTarget] = useState<InventoryItem | null>(null);
  const [usageItemTarget, setUsageItemTarget] = useState<InventoryItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const categories = Array.from(new Set(items.map(i => i.category)));

  const filteredItems = items.filter(i =>
    (category === 'all' || i.category === category) &&
    i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddItem = async (data: any) => {
    try {
      await addInventoryItem(data);
      showSuccessMessage('Vare tilføjet');
      setIsAddOpen(false);
    } catch (e) {
      alert('Fejl ved tilføjelse');
    }
  };

  const handleRestock = async (qty: number, cost?: number, notes?: string) => {
    if (!restockItemTarget) return;
    try {
      await restockItem(restockItemTarget.id, qty, cost, notes);
      showSuccessMessage('Lager opdateret');
      setRestockItemTarget(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordUsage = async (qty: number, taskId?: string, notes?: string) => {
    if (!usageItemTarget) return;
    try {
      await recordUsage(usageItemTarget.id, qty, taskId, notes);
      showSuccessMessage('Forbrug registreret');
      setUsageItemTarget(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <CircleStackIcon className="w-16 h-16 mx-auto mb-2" />
          <p className="font-medium">Fejl ved indlæsning af lager</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button onClick={refetch} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto">
          <ArrowPathIcon className="w-4 h-4 mr-2" />Prøv igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-brand-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Søg..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="border border-brand-input-border rounded-lg p-2 bg-brand-surface text-sm">
            <option value="all">Alle</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-bold py-2 px-4 rounded-lg shadow-md flex items-center"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Ny Vare
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Indlæser...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-border text-sm">
            <thead className="bg-brand-surface">
              <tr>
                <th className="px-3 py-2 text-left">Vare</th>
                <th className="px-3 py-2 text-left">Kategori</th>
                <th className="px-3 py-2 text-left">Beholdning</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredItems.map(item => (
                <tr key={item.id} className="bg-brand-surface">
                  <td className="px-3 py-2">{item.item_name}</td>
                  <td className="px-3 py-2 capitalize">{item.category.replace('_', ' ')}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium">{item.current_stock} {item.unit}</span>
                    <span className="text-xs text-brand-text-muted ml-1">(min {item.minimum_stock})</span>
                    {item.current_stock <= item.minimum_stock && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <BellAlertIcon className="w-3 h-3 mr-1" /> Lav beholdning
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => setUsageItemTarget(item)} className="text-sm text-brand-primary hover:underline">Forbrug</button>
                    <button onClick={() => setRestockItemTarget(item)} className="text-sm text-brand-primary hover:underline">Restock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <CircleStackIcon className="w-5 h-5 mr-2 text-brand-primary" /> Seneste Bevægelse
        </h3>
        {transactions.length === 0 ? (
          <p className="text-brand-text-muted text-sm">Ingen transaktioner.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-border text-sm">
              <thead className="bg-brand-surface">
                <tr>
                  <th className="px-3 py-2 text-left">Dato</th>
                  <th className="px-3 py-2 text-left">Vare</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Antal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {transactions.slice(0, 10).map(t => (
                  <tr key={t.id} className="bg-brand-surface">
                    <td className="px-3 py-2">{new Date(t.created_at).toLocaleDateString('da-DK')}</td>
                    <td className="px-3 py-2">{(t as any).inventory?.item_name || ''}</td>
                    <td className="px-3 py-2 capitalize">{t.type}</td>
                    <td className="px-3 py-2">{t.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddItemModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddItem} />
      <RestockModal item={restockItemTarget} onClose={() => setRestockItemTarget(null)} onSubmit={handleRestock} />
      <UsageModal item={usageItemTarget} onClose={() => setUsageItemTarget(null)} onSubmit={handleRecordUsage} />
    </div>
  );
};
