'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Dog,
  AlertOctagon,
  FolderOpen,
  Terminal,
  Activity,
  UserCheck,
  Trash2,
  Search,
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface Stats {
  users: number;
  pets: number;
  reports: number;
  scans: number;
  scanHistory: { date: string; count: number }[];
  systemHealth: {
    db: string;
    api: string;
    latency: string;
    uptime: string;
  };
}

interface UserRow {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface PetRow {
  id: string;
  petCode: string;
  name: string;
  species: string;
  breed: string | null;
  status: string;
  createdAt: string;
  owner: { displayName: string; email: string };
}

interface LogRow {
  timestamp: string;
  type: 'info' | 'warn' | 'error';
  service: string;
  message: string;
}

interface FileRow {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  petCode: string;
  createdAt: string;
}

type Tab = 'stats' | 'users' | 'pets' | 'files' | 'logs';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // States
  const [stats, setStats] = useState<Stats>({
    users: 145,
    pets: 218,
    reports: 34,
    scans: 1420,
    scanHistory: [
      { date: 'Mon', count: 120 },
      { date: 'Tue', count: 150 },
      { date: 'Wed', count: 180 },
      { date: 'Thu', count: 220 },
      { date: 'Fri', count: 290 },
      { date: 'Sat', count: 240 },
      { date: 'Sun', count: 220 },
    ],
    systemHealth: {
      db: 'Connected',
      api: 'Healthy',
      latency: '24ms',
      uptime: '14d 6h',
    },
  });

  const [users, setUsers] = useState<UserRow[]>([
    { id: '1', email: 'jan@mail.com', displayName: 'Jan Kowalski', role: 'ADMIN', createdAt: '2026-06-01' },
    { id: '2', email: 'anna@mail.com', displayName: 'Anna Nowak', role: 'USER', createdAt: '2026-06-15' },
    { id: '3', email: 'piotr@mail.com', displayName: 'Piotr Wiśniewski', role: 'USER', createdAt: '2026-06-20' },
  ]);

  const [pets, setPets] = useState<PetRow[]>([
    { id: '1', petCode: 'PET-A1F92B', name: 'Reksio', species: 'dog', breed: 'Golden Retriever', status: 'home', createdAt: '2026-06-05', owner: { displayName: 'Jan Kowalski', email: 'jan@mail.com' } },
    { id: '2', petCode: 'PET-Z8Y3X1', name: 'Luna', species: 'cat', breed: 'Brytyjski', status: 'lost', createdAt: '2026-06-10', owner: { displayName: 'Anna Nowak', email: 'anna@mail.com' } },
  ]);

  const [logs, setLogs] = useState<LogRow[]>([
    { timestamp: new Date(Date.now() - 5000).toISOString(), type: 'info', service: 'API_GATEWAY', message: 'GET /api/pets/public/PET-A1F92B - 200 OK (24ms)' },
    { timestamp: new Date(Date.now() - 12000).toISOString(), type: 'info', service: 'AUTH', message: 'User logged in successfully (Jan Kowalski)' },
    { timestamp: new Date(Date.now() - 45000).toISOString(), type: 'warn', service: 'DATABASE', message: 'Prisma Client: Slow query detected (duration: 210ms)' },
    { timestamp: new Date(Date.now() - 90000).toISOString(), type: 'error', service: 'AUTH_GATEWAY', message: 'POST /api/auth/login - 401 Unauthorized (Invalid password hash)' },
  ]);

  const [files, setFiles] = useState<FileRow[]>([
    { id: '1', name: 'reksio_profile.jpg', size: '2.4 MB', type: 'image/jpeg', uploadedBy: 'Reksio', petCode: 'PET-A1F92B', createdAt: '2026-06-05' },
    { id: '2', name: 'luna_bed.jpg', size: '1.8 MB', type: 'image/jpeg', uploadedBy: 'Luna', petCode: 'PET-Z8Y3X1', createdAt: '2026-06-12' },
  ]);

  // Fetch admin data from backend
  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('pet-id-token') || '';
    
    try {
      // 1. Fetch stats
      const statsRes = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (statsRes.ok) {
        const res = await statsRes.json();
        setStats(res.data);
      }

      // 2. Fetch users
      const usersRes = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (usersRes.ok) {
        const res = await usersRes.json();
        setUsers(res.data);
      }

      // 3. Fetch pets
      const petsRes = await fetch('/api/admin/pets', { headers: { 'Authorization': `Bearer ${token}` } });
      if (petsRes.ok) {
        const res = await petsRes.json();
        setPets(res.data);
      }

      // 4. Fetch logs
      const logsRes = await fetch('/api/admin/logs', { headers: { 'Authorization': `Bearer ${token}` } });
      if (logsRes.ok) {
        const res = await logsRes.json();
        setLogs(res.data);
      }

      // 5. Fetch files
      const filesRes = await fetch('/api/admin/files', { headers: { 'Authorization': `Bearer ${token}` } });
      if (filesRes.ok) {
        const res = await filesRes.json();
        setFiles(res.data);
      }
    } catch (e) {
      console.warn('API Offline - using mock admin dataset');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pet-id-token') || ''}`
        },
        body: JSON.stringify({ role: nextRole })
      });
    } catch (e) {}
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      try {
        await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('pet-id-token') || ''}` }
        });
      } catch (e) {}
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (confirm('Are you sure you want to delete this pet profile?')) {
      setPets(prev => prev.filter(p => p.id !== petId));
      try {
        await fetch(`/api/admin/pets/${petId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('pet-id-token') || ''}` }
        });
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6 relative z-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
            🛡️ PET ID Admin Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System status monitoring and profile management.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          isLoading={isLoading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide gap-2">
        {(['stats', 'users', 'pets', 'files', 'logs'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 font-display text-sm font-semibold capitalize border-b-2 transition-all duration-300 shrink-0 ${
              activeTab === t
                ? 'border-pet-amber-500 text-pet-amber-600 dark:text-pet-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            {t === 'stats' ? 'Dashboard' : t}
          </button>
        ))}
      </div>

      {/* Tab Contents: 1. Dashboard Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 flex items-center gap-4 bg-white/40 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-xl bg-pet-amber-100 dark:bg-pet-amber-950/40 text-pet-amber-600 dark:text-pet-amber-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.users}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Users</p>
              </div>
            </Card>

            <Card className="p-6 flex items-center gap-4 bg-white/40 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-xl bg-pet-teal-100 dark:bg-pet-teal-950/40 text-pet-teal-600 dark:text-pet-teal-400 flex items-center justify-center">
                <Dog className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.pets}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registered Pets</p>
              </div>
            </Card>

            <Card className="p-6 flex items-center gap-4 bg-white/40 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.reports}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Found Reports</p>
              </div>
            </Card>

            <Card className="p-6 flex items-center gap-4 bg-white/40 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-xl bg-pet-orange-100 dark:bg-pet-orange-950/40 text-pet-orange-600 dark:text-pet-orange-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.scans}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Scans</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Weekly QR Scan Rates
                </CardTitle>
              </CardHeader>
              
              <div className="flex items-end justify-between h-44 pt-4 px-2">
                {stats.scanHistory.map((item) => {
                  const maxVal = Math.max(...stats.scanHistory.map(h => h.count));
                  const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
                  return (
                    <div key={item.date} className="flex flex-col items-center flex-1 gap-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{item.count}</span>
                      <div
                        className="w-8 bg-gradient-to-t from-pet-amber-500 to-pet-orange-400 rounded-t-md transition-all duration-500"
                        style={{ height: `${pct * 1.1}px` }}
                      />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Health Panel */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  System Telemetry
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Database Status</span>
                  <Badge variant="success">{stats.systemHealth.db}</Badge>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">API Health</span>
                  <Badge variant="success">{stats.systemHealth.api}</Badge>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Avg API Latency</span>
                  <span className="text-xs text-slate-800 dark:text-white font-bold">{stats.systemHealth.latency}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">System Uptime</span>
                  <span className="text-xs text-slate-850 dark:text-slate-200 font-bold">{stats.systemHealth.uptime}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Contents: 2. Users management */}
      {activeTab === 'users' && (
        <Card className="p-6 space-y-4">
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {users
                  .filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-700 dark:text-slate-350">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{u.displayName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold">{u.createdAt}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          icon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          Role
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDeleteUser(u.id)}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Contents: 3. Pets catalog */}
      {activeTab === 'pets' && (
        <Card className="p-6 space-y-4">
          <Input
            placeholder="Search tags by code, name, or breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                  <th className="p-4">Pet Code</th>
                  <th className="p-4">Name / Breed</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {pets
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.petCode.toLowerCase().includes(searchQuery.toLowerCase()) || (p.breed && p.breed.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-700 dark:text-slate-350">
                      <td className="p-4 font-mono font-bold text-xs">{p.petCode}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            {p.name}
                            <Badge variant={p.status as any}>{p.status}</Badge>
                          </p>
                          <p className="text-xs text-slate-400 capitalize">{p.breed || p.species}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-750 dark:text-slate-300">{p.owner.displayName}</p>
                          <p className="text-[10px] text-slate-400">{p.owner.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDeletePet(p.id)}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Contents: 4. File Manager */}
      {activeTab === 'files' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Static File Allocations</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                  <th className="p-4">File Name</th>
                  <th className="p-4">Size / Type</th>
                  <th className="p-4">Linked Profile</th>
                  <th className="p-4">Upload Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-700 dark:text-slate-350">
                    <td className="p-4 font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-pet-amber-500 shrink-0" />
                      {file.name}
                    </td>
                    <td className="p-4 text-xs font-semibold">
                      {file.size} <span className="text-slate-400">({file.type})</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50">
                        {file.petCode} ({file.uploadedBy})
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold">{file.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Contents: 5. Live Logs / Errors */}
      {activeTab === 'logs' && (
        <Card className="p-6 bg-slate-950 border border-slate-900 text-slate-100 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <span className="font-mono text-xs font-bold text-slate-500 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-500 animate-pulse" />
              Console API stream
            </span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
          </div>

          <div className="font-mono text-xs space-y-3 leading-relaxed max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
            {logs.map((log, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 border-b border-slate-900/60 pb-2">
                <span className="text-slate-650 shrink-0 select-none">[{log.timestamp.substring(11, 19)}]</span>
                <span className={`shrink-0 uppercase font-bold ${
                  log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-yellow-500' : 'text-blue-400'
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-500 shrink-0 font-bold">[{log.service}]</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
