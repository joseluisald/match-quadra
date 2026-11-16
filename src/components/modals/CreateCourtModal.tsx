import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { SportModality } from '../../types';
import { STANDARD_1H_SLOTS } from '../../constants/slots';
import { Check, Clock, Plus, X, Wrench } from 'lucide-react';

const PRESET_PHOTOS = [
  {
    label: 'Grama Sintética (Society)',
    url: '/src/assets/images/court_arena_society_1792971629745.jpg'
  },
  {
    label: 'Beach Tennis / Areia',
    url: '/src/assets/images/court_beach_tennis_1792971630239.jpg'
  },
  {
    label: 'Ginásio de Futsal / Madeira',
    url: '/src/assets/images/court_indoor_futsal_1792971632199.jpg'
  }
];

const AVAILABLE_AMENITIES = [
  'Grama Sintética Monofilamento 50mm',
  'Iluminação LED Profissional',
  'Vestiários com Chuveiro Quente',
  'Churrasqueira Coberta para Confraternização',
  'Estacionamento Gratuito / Seguro',
  'Bar e Lanchonete com Espetinhos e Bebidas',
  'Placar Eletrônico Oficial',
  'Arquibancada para Torcida'
];

export const CreateCourtModal: React.FC = () => {
  const {
    isCreateCourtOpen,
    setIsCreateCourtOpen,
    editingCourt,
    setEditingCourt,
    addCourt,
    updateCourt,
    currentUser
  } = useApp();

  const isOpen = isCreateCourtOpen || !!editingCourt;

  const [name, setName] = useState('');
  const [modality, setModality] = useState<SportModality>('Futebol Society');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Paulo - SP');
  const [hourlyRate, setHourlyRate] = useState<number>(220);
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [phoneContact, setPhoneContact] = useState('(11) 98765-4321');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00'
  ]);
  const [customHourInput, setCustomHourInput] = useState('');
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Iluminação LED Profissional',
    'Vestiários com Chuveiro Quente',
    'Estacionamento Gratuito / Seguro'
  ]);

  useEffect(() => {
    if (editingCourt) {
      setName(editingCourt.name);
      setModality(editingCourt.modality);
      setAddress(editingCourt.address);
      setNeighborhood(editingCourt.neighborhood);
      setCity(editingCourt.city);
      setHourlyRate(editingCourt.hourlyRate);
      setImageUrl(editingCourt.imageUrl);
      setPhoneContact(editingCourt.phoneContact);
      setSelectedSlots(editingCourt.availableTimeSlots);
      setSelectedAmenities(editingCourt.amenities);
      setCustomHourInput('');
      setCustomAmenityInput('');
    } else if (isCreateCourtOpen) {
      setName('');
      setModality('Futebol Society');
      setAddress('');
      setNeighborhood('');
      setCity('São Paulo - SP');
      setHourlyRate(220);
      setImageUrl(PRESET_PHOTOS[0].url);
      setPhoneContact(currentUser?.phone || '');
      setSelectedSlots([
        '18:00 - 19:00',
        '19:00 - 20:00',
        '20:00 - 21:00',
        '21:00 - 22:00'
      ]);
      setSelectedAmenities([
        'Iluminação LED Profissional',
        'Vestiários com Chuveiro Quente',
        'Estacionamento Gratuito / Seguro'
      ]);
      setCustomHourInput('');
      setCustomAmenityInput('');
    }
  }, [editingCourt, isCreateCourtOpen, currentUser?.phone]);

  const handleClose = () => {
    setIsCreateCourtOpen(false);
    setEditingCourt(null);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    const parts = customAmenityInput
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    setSelectedAmenities(prev => {
      const next = [...prev];
      for (const part of parts) {
        const existingPreset = AVAILABLE_AMENITIES.find(
          a => a.toLowerCase() === part.toLowerCase()
        );
        const existingSelected = next.find(
          a => a.toLowerCase() === part.toLowerCase()
        );
        const target = existingPreset || existingSelected || part;
        if (!next.some(a => a.toLowerCase() === target.toLowerCase())) {
          next.push(target);
        }
      }
      return next;
    });

    setCustomAmenityInput('');
  };

  const removeCustomAmenity = (amenity: string) => {
    setSelectedAmenities(prev => prev.filter(a => a !== amenity));
  };

  const customAmenitiesList = selectedAmenities.filter(
    amenity => !AVAILABLE_AMENITIES.some(preset => preset.toLowerCase() === amenity.toLowerCase())
  );

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort()
    );
  };

  const addCustomSlot = () => {
    const trimmed = customHourInput.trim();
    if (!trimmed) return;
    // Allow user to type e.g. "16:00" and auto-expand to "16:00 - 17:00"
    let formattedSlot = trimmed;
    const hourMatch = /^(\d{2}):00$/.exec(trimmed);
    if (hourMatch) {
      const startH = parseInt(hourMatch[1], 10);
      const endH = (startH + 1) % 24;
      const endStr = `${String(endH).padStart(2, '0')}:00`;
      formattedSlot = `${trimmed} - ${endStr}`;
    }
    if (!selectedSlots.includes(formattedSlot)) {
      setSelectedSlots(prev => [...prev, formattedSlot].sort());
    }
    setCustomHourInput('');
  };

  const allSlotOptions = Array.from(new Set([...STANDARD_1H_SLOTS, ...selectedSlots])).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const finalSlots =
      selectedSlots.length > 0 ? selectedSlots : ['19:00 - 20:00', '20:00 - 21:00'];

    let ok = false;
    if (editingCourt) {
      ok = await updateCourt(editingCourt.id, {
        name,
        modality,
        address,
        neighborhood: neighborhood || 'Centro',
        city,
        hourlyRate: Number(hourlyRate) || 180,
        imageUrl,
        availableTimeSlots: finalSlots,
        amenities: selectedAmenities,
        phoneContact
      });
    } else {
      ok = await addCourt({
        name,
        modality,
        address,
        neighborhood: neighborhood || 'Centro',
        city,
        hourlyRate: Number(hourlyRate) || 180,
        imageUrl,
        availableTimeSlots: finalSlots,
        amenities: selectedAmenities,
        ownerId: currentUser?.id || '',
        ownerName: currentUser?.name || '',
        phoneContact
      });
    }

    if (ok) {
      handleClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCourt ? 'Editar Quadra, Valor & Horários' : 'Cadastrar Nova Quadra'}
      description="Defina nome, endereço, valor da hora e os blocos de 1 hora disponíveis para marcação de jogos."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Court Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Nome da Quadra / Arena *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Arena Real Soccer - Campo 2"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Modality & Hourly Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Modalidade Principal
            </label>
            <select
              value={modality}
              onChange={e => setModality(e.target.value as SportModality)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Futebol Society">Futebol Society (7x7)</option>
              <option value="Futsal">Futsal (5x5)</option>
              <option value="Beach Tennis">Beach Tennis</option>
              <option value="Basquete">Basquete</option>
              <option value="Vôlei">Vôlei</option>
              <option value="Padel">Padel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Valor da Hora (R$/h) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-bold">R$</span>
              <input
                type="number"
                min="50"
                max="800"
                step="10"
                required
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Address and Neighborhood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Endereço Completo *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ex: Rua das Palmeiras, 1500"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Bairro e Cidade
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Bairro"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Available 1h Time Slots Configuration */}
        <div className="space-y-2 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Horários Disponíveis na Grade (1h cada)</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-semibold tabular-nums">
              {selectedSlots.length} selecionados
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {allSlotOptions.map(slot => {
              const active = selectedSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer tabular-nums ${
                    active
                      ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
            <input
              type="text"
              value={customHourInput}
              onChange={e => setCustomHourInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSlot();
                }
              }}
              placeholder="Adicionar horário extra (ex: 16:00 ou 23:00 - 00:00)"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addCustomSlot} className="gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </Button>
          </div>
        </div>

        {/* Preset Photo Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Foto da Quadra
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_PHOTOS.map(p => (
              <button
                key={p.url}
                type="button"
                onClick={() => setImageUrl(p.url)}
                className={`relative rounded-lg overflow-hidden border transition-all text-left group ${
                  imageUrl === p.url
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p.url} alt={p.label} className="w-full h-16 object-cover" />
                <span className="block p-1 text-[10px] text-zinc-300 truncate bg-zinc-900">
                  {p.label}
                </span>
                {imageUrl === p.url && (
                  <div className="absolute top-1 right-1 bg-emerald-500 text-zinc-950 p-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities Checkboxes + Custom Amenities */}
        <div className="space-y-2.5 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estrutura e Comodidades</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-semibold tabular-nums">
              {selectedAmenities.length} selecionadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {AVAILABLE_AMENITIES.map(amenity => (
              <label
                key={amenity}
                className="flex items-center gap-2 text-xs text-zinc-300 hover:text-zinc-100 cursor-pointer select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-900"
                />
                <span className="truncate">{amenity}</span>
              </label>
            ))}
          </div>

          {customAmenitiesList.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
              <p className="text-[11px] font-medium text-zinc-400">
                Comodidades personalizadas adicionadas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {customAmenitiesList.map(item => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-xs font-medium text-emerald-300"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomAmenity(item)}
                      aria-label={`Remover ${item}`}
                      className="text-emerald-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
            <input
              type="text"
              value={customAmenityInput}
              onChange={e => setCustomAmenityInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomAmenity();
                }
              }}
              placeholder="Adicionar item personalizado (ex: Coletes e Bola grátis, Wi-Fi)"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addCustomAmenity} className="gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </Button>
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            WhatsApp da Recepção da Quadra
          </label>
          <input
            type="text"
            value={phoneContact}
            onChange={e => setPhoneContact(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {editingCourt ? 'Salvar Alterações da Quadra' : 'Cadastrar e Publicar Quadra'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
