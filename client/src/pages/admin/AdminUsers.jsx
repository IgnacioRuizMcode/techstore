import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Filter,
  UserPlus,
  Edit2,
  ShieldOff,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';

const roleConfig = {
  admin: { label: 'Admin', variant: 'default' },
  superadmin: { label: 'Superadmin', variant: 'default' },
  moderator: { label: 'Moderador', variant: 'secondary' },
  cliente: { label: 'Cliente', variant: 'outline' },
  customer: { label: 'Cliente', variant: 'outline' },
};

const RoleBadge = ({ role }) => {
  const config = roleConfig[role] || roleConfig.cliente;
  return <Badge variant={config.variant} className="font-medium">{config.label}</Badge>;
};

const ActiveBadge = ({ active }) =>
  active ? (
    <Badge variant="outline" className="text-green-500 border-green-500 inline-flex items-center gap-1.5">
      <CheckCircle className="h-3 w-3" /> Activo
    </Badge>
  ) : (
    <Badge variant="secondary" className="inline-flex items-center gap-1.5">
      <XCircle className="h-3 w-3" /> Inactivo
    </Badge>
  );

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState({ email: '', displayName: '', password: '', role: 'cliente' });
  const [formError, setFormError] = useState('');

  const ITEMS_PER_PAGE = 10;

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/all');
      setUsers(res.data.data);
      setFilteredUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (u) => u.displayName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
      );
    }
    if (roleFilter !== 'all') result = result.filter((u) => u.role === roleFilter);
    setFilteredUsers(result);
    setCurrentPage(1);
    setOpenActionId(null);
  }, [search, roleFilter, users]);

  const toggleActive = async (userId) => {
    await api.patch(`/users/${userId}/active`);
    fetchUsers();
    setOpenActionId(null);
  };

  const openCreateModal = () => {
    setUserForm({ email: '', displayName: '', password: '', role: 'cliente' });
    setFormError('');
    setModalMode('create');
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setUserForm({
      email: user.email || '',
      displayName: user.displayName || '',
      role: user.role || 'cliente',
    });
    setFormError('');
    setModalMode('edit');
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!userForm.email || !userForm.displayName) {
      setFormError('Email y nombre son requeridos');
      return;
    }
    if (modalMode === 'create' && !userForm.password) {
      setFormError('La contraseña es requerida');
      return;
    }
    try {
      if (modalMode === 'create') {
        await api.post('/users', userForm);
      } else {
        // El modal de edición ya incluye el campo "role", que se envía aquí
        await api.put(`/users/${editUser._id}`, {
          email: userForm.email,
          displayName: userForm.displayName,
          role: userForm.role,
        });
      }
      fetchUsers();
      setModalMode(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const staffUsers = users.filter((u) => ['admin', 'superadmin', 'moderator'].includes(u.role)).length;
  const newUsersThisMonth = users.filter((u) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const roleFilters = [
    { value: 'all', label: 'Todos', count: totalUsers },
    { value: 'admin', label: 'Administradores', count: users.filter((u) => u.role === 'admin').length },
    { value: 'superadmin', label: 'Superadmins', count: users.filter((u) => u.role === 'superadmin').length },
    { value: 'moderator', label: 'Moderadores', count: users.filter((u) => u.role === 'moderator').length },
    { value: 'cliente', label: 'Clientes', count: users.filter((u) => ['cliente', 'customer'].includes(u.role)).length },
  ];

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios de la tienda</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground" onClick={openCreateModal}>
          <UserPlus className="h-5 w-5 mr-2" /> Invitar usuario
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Users className="h-4 w-4 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalUsers}</p><p className="text-xs text-muted-foreground">Total usuarios</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle className="h-4 w-4 text-green-500" /></div><div><p className="text-2xl font-bold text-foreground">{activeUsers}</p><p className="text-xs text-muted-foreground">Activos</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-secondary/10 rounded-lg"><ShieldOff className="h-4 w-4 text-secondary" /></div><div><p className="text-2xl font-bold text-foreground">{staffUsers}</p><p className="text-xs text-muted-foreground">Staff</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-yellow-500/10 rounded-lg"><Clock className="h-4 w-4 text-yellow-500" /></div><div><p className="text-2xl font-bold text-foreground">{newUsersThisMonth}</p><p className="text-xs text-muted-foreground">Nuevos (mes)</p></div></CardContent></Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {roleFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                filter.value === roleFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {filter.label}
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${filter.value === roleFilter ? 'bg-primary-foreground/20' : 'bg-border'}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
        <Button variant="outline" className="flex items-center gap-2"><Filter className="h-4 w-4" /> Más filtros</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No se encontraron usuarios con los filtros actuales.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Usuario</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Rol</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Estado</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Último acceso</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Pedidos</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary-foreground">
                              {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{user.displayName || 'Sin nombre'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell"><RoleBadge role={user.role} /></td>
                      <td className="px-6 py-4"><ActiveBadge active={user.active} /></td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-CL') : 'Nunca'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-foreground">{user.ordersCount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === user._id ? null : user._id);
                            }}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openActionId === user._id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg py-1 z-10 animate-fade-in-up">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(user);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <Edit2 className="h-4 w-4" /> Editar usuario
                              </button>
                              <a
                                href={`mailto:${user.email}`}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="h-4 w-4" /> Enviar email
                              </a>
                              <hr className="my-1 border-border" />
                              {user.active ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleActive(user._id);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <ShieldOff className="h-4 w-4" /> Desactivar
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleActive(user._id);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-500 hover:bg-green-500/10 transition-colors"
                                >
                                  <CheckCircle className="h-4 w-4" /> Activar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {paginatedUsers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuarios
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><ChevronLeft className="h-5 w-5" /></Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'ghost'} size="sm" onClick={() => setCurrentPage(pageNum)}>
                      {pageNum}
                    </Button>
                  );
                })}
                <Button variant="ghost" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {modalMode === 'create' ? 'Invitar usuario' : 'Editar usuario'}
            </h2>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <Input value={userForm.displayName} onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })} required />
              </div>
              {modalMode === 'create' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Contraseña temporal</label>
                  <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">Rol</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="moderator">Moderador</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Cancelar</Button>
                <Button type="submit">{modalMode === 'create' ? 'Crear usuario' : 'Guardar cambios'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;