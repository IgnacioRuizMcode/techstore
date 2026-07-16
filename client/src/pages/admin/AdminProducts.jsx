import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCLP } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const CATEGORIES = [
  'Todas',
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

const ITEMS_PER_PAGE = 10;

// Helper para obtener la URL correcta de la imagen
const getImageUrl = (img) => {
  if (!img) return '/placeholder.svg';
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

// Badge de estado de stock
const StockBadge = ({ stock }) => {
  if (stock === 0) {
    return (
      <Badge variant="destructive" className="inline-flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Agotado
      </Badge>
    );
  }
  if (stock <= 5) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 inline-flex items-center gap-1">
        Bajo stock
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-green-500 border-green-500 inline-flex items-center gap-1">
      En stock
    </Badge>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editStockId, setEditStockId] = useState(null);
  const [editStockValue, setEditStockValue] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtros
  useEffect(() => {
    let result = [...products];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s) ||
          p.category?.toLowerCase().includes(s)
      );
    }

    if (category !== 'Todas') {
      result = result.filter((p) => p.category === category);
    }

    setFiltered(result);
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, category, products]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`¿Eliminar ${selectedIds.length} productos seleccionados?`)) {
      for (const id of selectedIds) {
        await api.delete(`/products/${id}`);
      }
      setSelectedIds([]);
      fetchProducts();
    }
  };

  const handleStockChange = async (id, newStock) => {
    try {
      await api.patch(`/products/${id}/stock`, { stock: Number(newStock) });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedProducts.map((p) => p._id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  // Paginación
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando productos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar {selectedIds.length}
            </Button>
          )}
          <Link to="/admin/products/new">
            <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              <Plus className="h-5 w-5 mr-2" />
              Agregar producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                cat === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Contador */}
      <p className="text-sm text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-foreground">{paginatedProducts.length}</span> de{' '}
        <span className="font-medium text-foreground">{filtered.length}</span> productos
      </p>

      {/* Estado vacío */}
      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-2xl">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No hay productos</h2>
          <p className="text-muted-foreground mb-6">
            {products.length === 0
              ? 'Agrega tu primer producto al catálogo'
              : 'No se encontraron productos con los filtros actuales'}
          </p>
          {products.length === 0 && (
            <Link to="/admin/products/new">
              <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <Plus className="h-5 w-5 mr-2" />
                Agregar producto
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Tabla de productos */}
      {filtered.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((p) => selectedIds.includes(p._id))
                      }
                      className="h-4 w-4 rounded border-border bg-input"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Producto
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Precio
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Stock
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                    Estado
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-muted/30 transition-colors">
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prod._id)}
                        onChange={() => toggleSelect(prod._id)}
                        className="h-4 w-4 rounded border-border bg-input"
                      />
                    </td>

                    {/* Producto con imagen */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                          <img
                            src={getImageUrl(prod.mainImage)}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/admin/products/${prod._id}/edit`}
                            className="font-medium text-primary hover:underline truncate block max-w-[200px]"
                          >
                            {prod.name}
                          </Link>
                          {prod.brand && (
                            <p className="text-xs text-muted-foreground">{prod.brand}</p>
                          )}
                          <p className="text-xs text-muted-foreground md:hidden">
                            {prod.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{prod.category}</span>
                    </td>

                    {/* Precio */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">
                        {formatCLP(prod.basePrice)}
                      </span>
                    </td>

                    {/* Stock con controles */}
                    <td className="px-6 py-4">
                      {editStockId === prod._id ? (
                        <Input
                          type="number"
                          min="0"
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(e.target.value)}
                          onBlur={() => {
                            handleStockChange(prod._id, editStockValue);
                            setEditStockId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleStockChange(prod._id, editStockValue);
                              setEditStockId(null);
                            }
                          }}
                          className="w-20 h-8 text-center"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 rounded-md bg-muted hover:bg-muted/80 text-foreground disabled:opacity-50"
                            onClick={() => handleStockChange(prod._id, prod.stock - 1)}
                            disabled={prod.stock <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span
                            className={`w-8 text-center font-medium cursor-pointer ${
                              prod.stock === 0
                                ? 'text-destructive'
                                : prod.stock <= 5
                                ? 'text-yellow-500'
                                : 'text-foreground'
                            }`}
                            onClick={() => {
                              setEditStockId(prod._id);
                              setEditStockValue(prod.stock.toString());
                            }}
                            title="Clic para editar manualmente"
                          >
                            {prod.stock}
                          </span>
                          <button
                            className="p-1 rounded-md bg-muted hover:bg-muted/80 text-foreground"
                            onClick={() => handleStockChange(prod._id, prod.stock + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <StockBadge stock={prod.stock} />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/producto/${prod.slug || prod._id}`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="Ver producto"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${prod._id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;