import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Phone,
  MapPin,
  Building,
  Globe,
  Hash,
  Pencil,
  Check,
  X,
} from 'lucide-react';

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    displayName: '',
    phone: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(res => {
      const u = res.data.user;
      setProfile({
        displayName: u.displayName || '',
        phone: u.phone || '',
        address: {
          street: u.address?.street || '',
          city: u.address?.city || '',
          state: u.address?.state || '',
          zip: u.address?.zip || '',
          country: u.address?.country || 'Chile',
        },
      });
    });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressSelect = (addressData) => {
    // addressData viene del componente AddressAutocomplete con los campos separados
    setProfile(prev => ({
      ...prev,
      address: {
        street: addressData.street || addressData.formattedAddress || prev.address.street,
        city: addressData.city || '',
        state: addressData.state || '',
        zip: addressData.zip || '',
        country: addressData.country || 'Chile',
      },
    }));
  };

  const handleAddressChange = (value) => {
    // Solo actualiza el campo street mientras se escribe manualmente
    setProfile(prev => ({
      ...prev,
      address: { ...prev.address, street: value },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Enviar el objeto address completo
      await api.put('/users/profile', {
        displayName: profile.displayName,
        phone: profile.phone,
        address: profile.address,
      });
      setEditMode(false);
      alert('Perfil actualizado correctamente');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Construir dirección formateada para mostrar en modo lectura
  const formattedAddress = [
    profile.address.street,
    profile.address.city,
    profile.address.state,
    profile.address.zip,
    profile.address.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Configuración de perfil</h2>
        {!editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Guardar
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Nombre
          </label>
          {editMode ? (
            <Input
              name="displayName"
              value={profile.displayName}
              onChange={handleChange}
              required
              placeholder="Tu nombre completo"
            />
          ) : (
            <p className="text-muted-foreground py-2 px-3 bg-muted/30 rounded-lg">
              {profile.displayName || '—'}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Teléfono
          </label>
          {editMode ? (
            <Input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="+56 9 1234 5678"
            />
          ) : (
            <p className="text-muted-foreground py-2 px-3 bg-muted/30 rounded-lg">
              {profile.phone || '—'}
            </p>
          )}
        </div>

        <Separator className="my-4" />

        {/* Dirección */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Dirección de envío
          </h4>

          {!editMode ? (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-muted-foreground text-sm">
                {formattedAddress || 'No has configurado una dirección de envío.'}
              </p>
              {!formattedAddress && (
                <p className="text-xs text-muted-foreground mt-2">
                  Haz clic en "Editar" para agregar tu dirección. Se usará como predeterminada en tus compras.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Calle y número
                </label>
                <AddressAutocomplete
                  value={profile.address.street}
                  onChange={handleAddressChange}
                  onSelect={handleAddressSelect}
                  placeholder="Busca tu dirección..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Ciudad
                </label>
                <Input
                  name="address.city"
                  value={profile.address.city}
                  onChange={handleChange}
                  placeholder="Santiago"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Estado / Región
                </label>
                <Input
                  name="address.state"
                  value={profile.address.state}
                  onChange={handleChange}
                  placeholder="Región Metropolitana"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  Código postal
                </label>
                <Input
                  name="address.zip"
                  value={profile.address.zip}
                  onChange={handleChange}
                  placeholder="8320000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  País
                </label>
                <Input
                  name="address.country"
                  value={profile.address.country}
                  onChange={handleChange}
                  placeholder="Chile"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;