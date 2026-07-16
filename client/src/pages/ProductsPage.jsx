import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  DollarSign,
  Tag,
  Package,
  Filter,
  Sparkles,
  Laptop,
  Monitor,
  Cpu,
  Smartphone,
  Tablet,
  Headphones,
  Gamepad2,
  Home,
  Wifi,
  Paperclip,
} from 'lucide-react';

const VALID_CATEGORIES = [
  'Notebooks', 'Computación', 'Componentes', 'Smartphones',
  'Gaming', 'Audio', 'Hogar', 'Conectividad', 'Tablets', 'Accesorios',
];

const CATEGORY_ICONS = {
  Notebooks: Laptop,
  Computación: Monitor,
  Componentes: Cpu,
  Smartphones: Smartphone,
  Gaming: Gamepad2,
  Audio: Headphones,
  Hogar: Home,
  Conectividad: Wifi,
  Tablets: Tablet,
  Accesorios: Paperclip,
};

const CATEGORIES_WITH_SUBS = [
  {
    name: 'Notebooks',
    subcategories: [
      { label: 'Notebooks Gamer', search: 'gamer' },
      { label: 'Ultrabooks', search: 'ultrabook' },
      { label: 'MacBook', search: 'macbook' },
      { label: 'Workstation', search: 'workstation' },
      { label: '2 en 1', search: '2 en 1' },
    ],
  },
  {
    name: 'Computación',
    subcategories: [
      { label: 'PC Escritorio', search: 'escritorio' },
      { label: 'PC Gamer', search: 'gamer pc' },
      { label: 'All-in-One', search: 'all in one' },
      { label: 'Mac', search: 'mac' },
      { label: 'Mini PC', search: 'mini pc' },
    ],
  },
  {
    name: 'Componentes',
    subcategories: [
      { label: 'CPU Intel', search: 'Intel Core' },
      { label: 'CPU AMD Ryzen', search: 'Ryzen' },
      { label: 'GPU NVIDIA', search: 'NVIDIA' },
      { label: 'GPU AMD Radeon', search: 'Radeon' },
      { label: 'Placas Madre', search: 'placa madre' },
      { label: 'RAM', search: 'RAM' },
      { label: 'SSD / Almacenamiento', search: 'SSD' },
      { label: 'Fuentes de Poder', search: 'fuente' },
      { label: 'Coolers / Refrigeración', search: 'cooler' },
    ],
  },
  {
    name: 'Smartphones',
    subcategories: [
      { label: 'iPhone', search: 'iPhone' },
      { label: 'Samsung Galaxy', search: 'Samsung Galaxy' },
      { label: 'Xiaomi', search: 'Xiaomi' },
      { label: 'Google Pixel', search: 'Pixel' },
      { label: 'Gama Alta', search: 'Pro Max Ultra' },
      { label: 'Gama Media', search: 'A5' },
    ],
  },
  {
    name: 'Tablets',
    subcategories: [
      { label: 'iPad', search: 'iPad' },
      { label: 'Samsung Galaxy Tab', search: 'Galaxy Tab' },
      { label: 'Lenovo Tab', search: 'Lenovo Tab' },
      { label: 'Kindle / E-readers', search: 'Kindle' },
    ],
  },
  {
    name: 'Audio',
    subcategories: [
      { label: 'Audífonos Inalámbricos', search: 'audífonos' },
      { label: 'Audífonos Gamer', search: 'headset' },
      { label: 'Parlantes', search: 'parlante' },
      { label: 'Micrófonos', search: 'micrófono' },
      { label: 'Soundbars', search: 'soundbar' },
    ],
  },
  {
    name: 'Gaming',
    subcategories: [
      { label: 'Consolas', search: 'PlayStation Xbox Nintendo' },
      { label: 'Controles', search: 'control' },
      { label: 'Teclados Gamer', search: 'teclado gamer' },
      { label: 'Mouse Gamer', search: 'mouse gamer' },
      { label: 'Monitores Gamer', search: 'monitor gamer' },
      { label: 'Sillas Gamer', search: 'silla gamer' },
    ],
  },
  {
    name: 'Hogar',
    subcategories: [
      { label: 'Smartwatches', search: 'watch' },
      { label: 'Asistentes Virtuales', search: 'Echo Google Home' },
      { label: 'Cámaras de Seguridad', search: 'cámara seguridad' },
      { label: 'Routers / WiFi', search: 'router wifi' },
      { label: 'Smart TV', search: 'TV' },
    ],
  },
  {
    name: 'Conectividad',
    subcategories: [
      { label: 'Cables USB / HDMI', search: 'cable' },
      { label: 'Hubs / Adaptadores', search: 'hub adaptador' },
      { label: 'Cargadores', search: 'cargador' },
      { label: 'Redes / Ethernet', search: 'ethernet' },
      { label: 'Thunderbolt', search: 'thunderbolt' },
    ],
  },
  {
    name: 'Accesorios',
    subcategories: [
      { label: 'Teclados', search: 'teclado' },
      { label: 'Mouse', search: 'mouse' },
      { label: 'Webcams', search: 'webcam' },
      { label: 'Mochilas / Fundas', search: 'mochila funda' },
      { label: 'Soportes / Bases', search: 'soporte base' },
      { label: 'Mousepads', search: 'mousepad' },
    ],
  },
];

const ITEMS_PER_PAGE = 12;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'Todas';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const inStockOnly = searchParams.get('inStock') === 'true';

  const globalMaxPrice = useMemo(() => {
    if (allProducts.length === 0) return 3000000;
    return Math.max(...allProducts.map(p => p.basePrice));
  }, [allProducts]);

  const [priceRange, setPriceRange] = useState([
    Number(minPrice) || 0,
    Number(maxPrice) || globalMaxPrice,
  ]);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const prods = res.data.data.filter(p => VALID_CATEGORIES.includes(p.category));
        setAllProducts(prods);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPriceRange([Number(minPrice) || 0, Number(maxPrice) || globalMaxPrice]);
  }, [minPrice, maxPrice, globalMaxPrice]);

  // Marcas con contador
  const brandsWithCount = useMemo(() => {
    const counts = {};
    allProducts.forEach(p => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [allProducts]);

  // Categorías con contador
  const categoriesWithCount = useMemo(() => {
    const counts = {};
    allProducts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return [('Todas'), ...new Set(allProducts.map(p => p.category))]
      .map(cat => ({
        name: cat,
        count: cat === 'Todas' ? allProducts.length : (counts[cat] || 0),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  // Filtrado
  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s) ||
        p.category?.toLowerCase().includes(s)
      );
    }
    if (category !== 'Todas') result = result.filter(p => p.category === category);
    if (minPrice) result = result.filter(p => p.basePrice >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.basePrice <= Number(maxPrice));
    if (selectedBrands.length > 0) result = result.filter(p => selectedBrands.includes(p.brand));
    if (inStockOnly) result = result.filter(p => p.stock > 0);
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'price-desc': result.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'popular': result.sort((a, b) => b.stock - a.stock); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [allProducts, search, category, minPrice, maxPrice, selectedBrands, inStockOnly, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => setCurrentPage(1), [search, category, minPrice, maxPrice, selectedBrands, inStockOnly, sortBy]);

  const updateSearchParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'Todas' && value !== 'newest' && value !== 'false' && value !== '' && value !== '0') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Manejar clic en subcategoría
  const handleSubcategoryClick = (searchTerm) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', searchTerm);
    newParams.delete('category');
    setSearchParams(newParams, { replace: true });
  };

  const setCategory = (val) => updateSearchParam('category', val === 'Todas' ? '' : val);
  const setSortBy = (val) => updateSearchParam('sort', val === 'newest' ? '' : val);
  const setInStockOnly = (val) => updateSearchParam('inStock', val ? 'true' : '');
  const toggleBrand = (brand) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const handlePriceChange = (values) => {
    setPriceRange(values);
    updateSearchParam('minPrice', values[0] > 0 ? String(values[0]) : '');
    updateSearchParam('maxPrice', values[1] < globalMaxPrice ? String(values[1]) : '');
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setSelectedBrands([]);
    setCurrentPage(1);
    setPriceRange([0, globalMaxPrice]);
  };

  const hasActiveFilters = search || category !== 'Todas' || minPrice || maxPrice || selectedBrands.length > 0 || inStockOnly;

  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Catálogo | TechStore Chile</title>
        <meta name="description" content={`Explora nuestro catálogo de productos tecnológicos. ${category !== 'Todas' ? `Categoría: ${category}` : 'Notebooks, smartphones, gaming y más.'}`} />
      </Helmet>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-muted-foreground">Filtros activos:</span>
          {category !== 'Todas' && (
            <Badge variant="secondary" className="cursor-pointer gap-1 rounded-full" onClick={() => setCategory('Todas')}>
              {category} <X className="h-3 w-3" />
            </Badge>
          )}
          {minPrice && (
            <Badge variant="secondary" className="cursor-pointer gap-1 rounded-full" onClick={() => updateSearchParam('minPrice', '')}>
              Desde ${Number(minPrice).toLocaleString('es-CL')} <X className="h-3 w-3" />
            </Badge>
          )}
          {maxPrice && (
            <Badge variant="secondary" className="cursor-pointer gap-1 rounded-full" onClick={() => updateSearchParam('maxPrice', '')}>
              Hasta ${Number(maxPrice).toLocaleString('es-CL')} <X className="h-3 w-3" />
            </Badge>
          )}
          {inStockOnly && (
            <Badge variant="secondary" className="cursor-pointer gap-1 rounded-full" onClick={() => setInStockOnly(false)}>
              En stock <X className="h-3 w-3" />
            </Badge>
          )}
          {selectedBrands.map(brand => (
            <Badge key={brand} variant="secondary" className="cursor-pointer gap-1 rounded-full" onClick={() => toggleBrand(brand)}>
              {brand} <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Barra lateral de filtros (escritorio) */}
        {filtersOpen && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-5">
              {/* Categorías con subcategorías (acordeón corregido) */}
              <Card>
                <CardContent className="p-4 space-y-1">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> Categorías
                  </h4>
                  <Accordion type="single" collapsible className="w-full">
                    {CATEGORIES_WITH_SUBS.filter(cat => VALID_CATEGORIES.includes(cat.name)).map(cat => {
                      const IconComp = CATEGORY_ICONS[cat.name] || Tag;
                      const count = categoriesWithCount.find(c => c.name === cat.name)?.count || 0;
                      return (
                        <AccordionItem key={cat.name} value={cat.name} className="border-b-0">
                          <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 rounded-lg px-2 group">
                            <div className="flex items-center gap-2 text-sm flex-1">
                              <IconComp className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCategory(cat.name);
                                }}
                                className="text-left font-medium hover:text-primary transition-colors"
                              >
                                {cat.name}
                              </button>
                              <span className="text-xs text-muted-foreground ml-auto mr-2">({count})</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-0 pl-8">
                            <div className="flex flex-col gap-0.5">
                              {cat.subcategories.map(sub => (
                                <button
                                  key={sub.label}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubcategoryClick(sub.search);
                                  }}
                                  className="text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                                >
                                  {sub.label}
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Precio */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Rango de precio
                  </h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={priceRange[0] > 0 ? priceRange[0] : ''}
                      onChange={(e) => handlePriceChange([Number(e.target.value) || 0, priceRange[1]])}
                      className="h-9 text-sm"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={priceRange[1] < globalMaxPrice ? priceRange[1] : ''}
                      onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value) || globalMaxPrice])}
                      className="h-9 text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Hasta ${globalMaxPrice.toLocaleString('es-CL')}
                  </p>
                </CardContent>
              </Card>

              {/* Marcas con Checkbox de shadcn y scroll personalizado */}
              {brandsWithCount.length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary" /> Marcas
                    </h4>
                    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {brandsWithCount.map(({ brand, count }) => (
                        <label
                          key={brand}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                            selectedBrands.includes(brand)
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={() => toggleBrand(brand)}
                              className="h-4 w-4 rounded"
                            />
                            {brand}
                          </div>
                          <span className="text-xs opacity-60">({count})</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disponibilidad */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> Disponibilidad
                  </h4>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                    <Checkbox
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked === true)}
                      className="h-4 w-4 rounded"
                    />
                    Solo productos en stock
                  </label>
                </CardContent>
              </Card>

              {hasActiveFilters && (
                <Button variant="destructive" className="w-full rounded-xl" onClick={clearFilters}>
                  Limpiar todos los filtros
                </Button>
              )}
            </div>
          </aside>
        )}

        {/* Panel móvil de filtros (AHORA CON SUBCATEGORÍAS EN ACORDEÓN) */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[90vw] bg-card border-r border-border shadow-2xl overflow-y-auto custom-scrollbar animate-slide-in-right">
              <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-semibold text-foreground text-lg">Filtros</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* Ordenar */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Ordenar por</h4>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                    <option value="popular">Más populares</option>
                    <option value="rating">Mejor valorados</option>
                    <option value="name">Nombre A-Z</option>
                  </select>
                </div>
                <Separator />

                {/* Categorías con subcategorías (acordeón) para móviles */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Categorías</h4>
                  <Accordion type="single" collapsible className="w-full">
                    {CATEGORIES_WITH_SUBS.filter(cat => VALID_CATEGORIES.includes(cat.name)).map(cat => {
                      const IconComp = CATEGORY_ICONS[cat.name] || Tag;
                      const count = categoriesWithCount.find(c => c.name === cat.name)?.count || 0;
                      return (
                        <AccordionItem key={cat.name} value={cat.name} className="border-b-0">
                          <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 rounded-lg px-2 group">
                            <div className="flex items-center gap-2 text-sm flex-1">
                              <IconComp className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCategory(cat.name);
                                  setMobileFiltersOpen(false);
                                }}
                                className="text-left font-medium hover:text-primary transition-colors"
                              >
                                {cat.name}
                              </button>
                              <span className="text-xs text-muted-foreground ml-auto mr-2">({count})</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-0 pl-8">
                            <div className="flex flex-col gap-0.5">
                              {cat.subcategories.map(sub => (
                                <button
                                  key={sub.label}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubcategoryClick(sub.search);
                                    setMobileFiltersOpen(false);
                                  }}
                                  className="text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                                >
                                  {sub.label}
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
                <Separator />

                {/* Precio */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Rango de precio</h4>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Mín" value={priceRange[0] > 0 ? priceRange[0] : ''} onChange={(e) => handlePriceChange([Number(e.target.value) || 0, priceRange[1]])} className="h-9 text-sm" />
                    <span className="text-muted-foreground">–</span>
                    <Input type="number" placeholder="Máx" value={priceRange[1] < globalMaxPrice ? priceRange[1] : ''} onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value) || globalMaxPrice])} className="h-9 text-sm" />
                  </div>
                </div>
                <Separator />
                {/* Marcas */}
                {brandsWithCount.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">Marcas</h4>
                      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar">
                        {brandsWithCount.map(({ brand, count }) => (
                          <label key={brand} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-muted">
                            <div className="flex items-center gap-2">
                              <Checkbox checked={selectedBrands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
                              {brand}
                            </div>
                            <span className="text-xs opacity-60">({count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                {/* Disponibilidad */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Disponibilidad</h4>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={inStockOnly} onCheckedChange={(checked) => setInStockOnly(checked === true)} />
                    Solo productos en stock
                  </label>
                </div>
                {hasActiveFilters && (
                  <Button variant="destructive" className="w-full rounded-xl" onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}>
                    Limpiar todos los filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 min-w-0">
          {/* Barra de resultados con orden compacto */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {category !== 'Todas' ? category : (search ? `Resultados para "${search}"` : 'Todos los productos')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 rounded-lg">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 rounded-lg">
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="newest">Más recientes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="popular">Más populares</option>
                <option value="rating">Mejor valorados</option>
                <option value="name">Nombre A-Z</option>
              </select>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid de productos */}
          {loading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex p-4 bg-muted/50 rounded-full mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-1">No se encontraron productos</p>
              <p className="text-sm text-muted-foreground mb-6">
                {category !== 'Todas' && `No hay productos en la categoría "${category}".`}
                {search && `No hay resultados para "${search}".`}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {paginatedProducts.map(prod => (
                <ProductCard key={prod._id} product={prod} variant={viewMode} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-xl">
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground px-1">...</span>}
                      <Button variant={currentPage === p ? 'default' : 'ghost'} size="sm" onClick={() => setCurrentPage(p)} className="h-9 w-9 rounded-lg">{p}</Button>
                    </React.Fragment>
                  ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-xl">
                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;