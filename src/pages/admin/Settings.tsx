import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Database, 
  Mail, 
  Shield, 
  Globe, 
  Bell,
  Palette,
  Server,
  Key
} from 'lucide-react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoRenewalEnabled: boolean;
  defaultSubscriptionType: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Jornal Destaque',
    siteDescription: 'O seu jornal digital de confiança',
    siteUrl: 'https://jornaldestaque.com',
    adminEmail: 'admin@jornaldestaque.com',
    supportEmail: 'suporte@jornaldestaque.com',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    autoRenewalEnabled: true,
    defaultSubscriptionType: 'mensal',
    emailNotifications: true,
    smsNotifications: false,
    theme: 'auto',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Simular carregamento das configurações
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Aqui você faria a chamada para a API para carregar as configurações
      // const response = await adminAPI.getSettings();
      // setSettings(response.data);
      
      // Por enquanto, usando dados mockados
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aqui você faria a chamada para salvar as configurações
      // await adminAPI.updateSettings(settings);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!'
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      loadSettings();
      setHasChanges(false);
      toast({
        title: 'Informação',
        description: 'Configurações restauradas para o padrão'
      });
    }
  };

  if (loading && !hasChanges) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Configurações do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as configurações gerais da aplicação
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Alterações não salvas
            </Badge>
          )}
          <Button onClick={resetToDefaults} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={loading || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
            <CardDescription>
              Configurações básicas do site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nome do Site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                placeholder="Nome do seu site"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Descrição</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                placeholder="Descrição do site"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteUrl">URL do Site</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                placeholder="https://seusite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de Email
            </CardTitle>
            <CardDescription>
              Configurações relacionadas ao envio de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email do Administrador</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                placeholder="admin@seusite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                placeholder="suporte@seusite.com"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificações por email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança e Acesso
            </CardTitle>
            <CardDescription>
              Configurações de segurança e controle de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Manutenção</Label>
                <p className="text-sm text-muted-foreground">
                  Bloquear acesso público durante manutenção
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Registro</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir novos registros de usuários
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => handleSettingChange('allowRegistration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verificação de Email</Label>
                <p className="text-sm text-muted-foreground">
                  Exigir verificação de email no registro
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Arquivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Arquivos e Upload
            </CardTitle>
            <CardDescription>
              Configurações de upload de arquivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Tamanho Máximo (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedFileTypes">Tipos Permitidos</Label>
              <Input
                id="allowedFileTypes"
                value={settings.allowedFileTypes.join(', ')}
                onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                placeholder="pdf, jpg, png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Assinaturas
            </CardTitle>
            <CardDescription>
              Configurações relacionadas às assinaturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Renovação Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Renovar assinaturas automaticamente
                </p>
              </div>
              <Switch
                checked={settings.autoRenewalEnabled}
                onCheckedChange={(checked) => handleSettingChange('autoRenewalEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSubscriptionType">Tipo Padrão</Label>
              <Select
                value={settings.defaultSubscriptionType}
                onValueChange={(value) => handleSettingChange('defaultSubscriptionType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo padrão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Interface e Aparência
            </CardTitle>
            <CardDescription>
              Configurações de tema e idioma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Configurações Avançadas
          </CardTitle>
          <CardDescription>
            Configurações técnicas e avançadas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cache do Sistema</Label>
              <Button variant="outline" size="sm" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Cache
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Backup do Banco</Label>
              <Button variant="outline" size="sm" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Criar Backup
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Logs do Sistema</Label>
              <Button variant="outline" size="sm" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Ver Logs
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Estatísticas</Label>
              <Button variant="outline" size="sm" className="w-full">
            <SettingsIcon className="h-4 w-4 mr-2" />
                Ver Estatísticas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

