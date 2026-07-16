import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Package,
  ArrowLeft,
  Save,
  ImagePlus,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  'Notebooks',
  'Computación',
  'Componentes',
  'Smartphones',
  'Tablets',
  'Accesorios',
  'Gaming',
  'Audio',
  'Hogar',
  'Conectividad',
];

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0],
    brand: '',
    basePrice: '',
    stock: '0',
    description: '',
  });
  const [variants, setVariants] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Imágenes adicionales
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/products/${id}`)
        .then((res) => {
          const p = res.data.data;
          setForm({
            name: p.name || '',
            category: p.category || CATEGORIES[0],
            brand: p.brand || '',
            basePrice: p.basePrice || '',
            stock: p.stock !== undefined ? String(p.stock) : '0',
            description: p.description || '',
          });
          if (p.mainImage) {
            const fullUrl = `${API_URL}${p.mainImage}`;
            setCurrentImage(p.mainImage);
            setPreview(fullUrl);
          }
          if (p.images) {
            setAdditionalPreviews(p.images.map((img) => `${API_URL}${img}`));
          }
          if (p.variants) {
            setVariants(
              p.variants.map((v) => ({
                ...v,
                price: v.price !== undefined ? String(v.price) : '',
                stock: v.stock !== undefined ? String(v.stock) : '0',
                name: v.name || '',
              }))
            );
          }
        })
        .catch(() => alert('No se pudo cargar el producto'));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleCategoryChange = (value) => {
    setForm((prev) => ({ ...prev, category: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', stock: '0', attributes: {} }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleMainFile = (e) => {
    const file = e.target.files[0];
    setMainImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(currentImage ? `${API_URL}${currentImage}` : '');
    }
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setAdditionalImages(files);
    setAdditionalPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeAdditionalPreview = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Requerido';
    if (!form.basePrice || parseFloat(form.basePrice) <= 0)
      newErrors.basePrice = 'Debe ser mayor a 0';
    if (parseInt(form.stock) < 0) newErrors.stock = 'No puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!window.confirm(isEdit ? '¿Guardar cambios?' : '¿Crear producto?')) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('brand', form.brand);
      formData.append('basePrice', form.basePrice);
      formData.append('stock', form.stock);
      formData.append('description', form.description);
      if (mainImage) formData.append('mainImage', mainImage);
      formData.append('variants', JSON.stringify(variants));

      additionalImages.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/admin/products');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/products')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? 'Modifica los datos del producto'
                : 'Agrega un nuevo producto al catálogo'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Información del producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Notebook Gamer Pro"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Categoría y Marca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Categoría <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="Ej: Asus, Samsung..."
                  />
                </div>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">
                    Precio base (CLP) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    step="1"
                    value={form.basePrice}
                    onChange={handleChange}
                    placeholder="Ej: 499990"
                    className={errors.basePrice ? 'border-destructive' : ''}
                  />
                  {errors.basePrice && (
                    <p className="text-xs text-destructive">{errors.basePrice}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">
                    Stock <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="Cantidad disponible"
                    className={errors.stock ? 'border-destructive' : ''}
                  />
                  {errors.stock && (
                    <p className="text-xs text-destructive">{errors.stock}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descripción del producto..."
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Columna derecha: imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                Imágenes del producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imagen principal */}
              <div className="space-y-2">
                <Label>Imagen principal</Label>
                <div
                  onClick={() => document.getElementById('mainFileInput').click()}
                  className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors aspect-square bg-muted/30 flex items-center justify-center"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Vista previa"
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="text-sm">Haz clic para subir imagen</p>
                      <p className="text-xs">JPG, PNG o WebP</p>
                    </div>
                  )}
                  <input
                    id="mainFileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleMainFile}
                    className="hidden"
                  />
                </div>
                {preview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMainImage(null);
                      setPreview('');
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar imagen
                  </Button>
                )}
              </div>

              {/* Imágenes adicionales */}
              <div className="space-y-2">
                <Label>Imágenes adicionales (máx. 5)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImages}
                />
                {additionalPreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {additionalPreviews.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                      >
                        <img
                          src={url}
                          alt={`preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalPreview(idx)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Variantes */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary">
                Opcional
              </Badge>
              Variantes del producto
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar variante
            </Button>
          </CardHeader>
          <CardContent>
            {variants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay variantes. Agrega variantes si el producto tiene diferentes
                versiones (color, tamaño, capacidad).
              </p>
            ) : (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-xl border border-border"
                  >
                    <Input
                      placeholder="Nombre (ej: 16GB RAM)"
                      value={v.name}
                      onChange={(e) =>
                        handleVariantChange(idx, 'name', e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Precio extra"
                      value={v.price}
                      onChange={(e) =>
                        handleVariantChange(idx, 'price', e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={(e) =>
                        handleVariantChange(idx, 'stock', e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(idx)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón submit (móvil) */}
        <div className="mt-6 lg:hidden">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;