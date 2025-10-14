import React, { useState, useEffect } from 'react';
import { Newspaper, Users, CreditCard, TrendingUp } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Jornal, User, Subscription } from '../../types/api';

interface DashboardStats {
  totalJornais: number;
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalJornais: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentJornais, setRecentJornais] = useState<Jornal[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jornais, users, subscriptions] = await Promise.all([
          adminAPI.getJornais({ limit: 10 }),
          adminAPI.getUsers({ limit: 10 }),
          adminAPI.getSubscriptions({ limit: 100 }),
        ]);

        const activeSubscriptions = subscriptions.filter(sub => 
          sub.is_active && new Date(sub.end_date) > new Date()
        );

        setStats({
          totalJornais: jornais.length,
          totalUsers: users.length,
          totalSubscriptions: subscriptions.length,
          activeSubscriptions: activeSubscriptions.length,
        });

        setRecentJornais(jornais.slice(0, 5));
        setRecentUsers(users.slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSubscriptionTypeLabel = (type: string) => {
    const labels = {
      diario: 'Diário',
      semanal: 'Semanal',
      mensal: 'Mensal',
      anual: 'Anual',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema Jornal Destaque</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 animate-scale-in overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Newspaper className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total de Jornais</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.totalJornais}</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 animate-scale-in overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3 bg-secondary/20 rounded-xl">
                <Users className="h-8 w-8 text-secondary" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 animate-scale-in overflow-hidden" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3 bg-accent/20 rounded-xl">
                <CreditCard className="h-8 w-8 text-accent" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Assinaturas Ativas</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 animate-scale-in overflow-hidden" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3 bg-primary/20 rounded-xl">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Assinaturas</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.totalSubscriptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Jornais */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="px-6 py-4 border-b border-border bg-gradient-primary/10">
            <h3 className="text-lg font-semibold text-foreground">Jornais Recentes</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {recentJornais.map((jornal, idx) => (
                <div key={jornal.id} className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-accent/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${0.5 + idx * 0.1}s` }}>
                  <div className="flex-shrink-0">
                    {jornal.capa ? (
                      <img
                        src={jornal.capa}
                        alt={jornal.titulo}
                        className="h-12 w-12 rounded-lg object-cover ring-2 ring-border group-hover:ring-primary transition-all"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Newspaper className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {jornal.titulo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(jornal.data_publicacao)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      jornal.is_active 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {jornal.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
              {recentJornais.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum jornal encontrado
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="px-6 py-4 border-b border-border bg-gradient-accent/10">
            <h3 className="text-lg font-semibold text-foreground">Usuários Recentes</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {recentUsers.map((user, idx) => (
                <div key={user.id} className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-accent/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${0.6 + idx * 0.1}s` }}>
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.nome}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {user.tipo_subscricao && (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-secondary/20 text-secondary">
                        {getSubscriptionTypeLabel(user.tipo_subscricao)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum usuário encontrado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
