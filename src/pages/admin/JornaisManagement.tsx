import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Upload, Download } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Jornal } from '../../types/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreateJornalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingJornal?: Jornal | null;
}

const CreateJornalModal: React.FC<CreateJornalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingJornal
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    capa: null as File | null,
    arquivopdf: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingJornal) {
      setFormData({
        titulo: editingJornal.titulo,
        capa: null,
        arquivopdf: null,
      });
    } else {
      setFormData({
        titulo: '',
        capa: null,
        arquivopdf: null,
      });
    }
  }, [editingJornal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || (!editingJornal && !formData.arquivopdf)) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('titulo', formData.titulo);
      
      if (formData.capa) {
        submitData.append('capa', formData.capa);
      }
      
      if (formData.arquivopdf) {
        submitData.append('arquivopdf', formData.arquivopdf);
      }

      if (editingJornal) {
        await adminAPI.updateJornal(editingJornal.id, submitData);
        toast.success('Jornal atualizado com sucesso!');
      } else {
        await adminAPI.createJornal(submitData);
        toast.success('Jornal criado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar jornal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 animate-fade-in">
      <div className="relative top-20 mx-auto p-6 border border-border w-96 shadow-2xl rounded-2xl bg-card/95 backdrop-blur-xl animate-scale-in">
        <div className="mt-3">
          <h3 className="text-xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            {editingJornal ? 'Editar Jornal' : 'Criar Novo Jornal'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capa">Capa (opcional)</Label>
              <Input
                id="capa"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, capa: e.target.files?.[0] || null })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivopdf">Arquivo PDF *</Label>
              <Input
                id="arquivopdf"
                type="file"
                accept=".pdf"
                onChange={(e) => setFormData({ ...formData, arquivopdf: e.target.files?.[0] || null })}
                required={!editingJornal}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : editingJornal ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const JornaisManagement: React.FC = () => {
  const navigate = useNavigate();
  const [jornais, setJornais] = useState<Jornal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJornal, setEditingJornal] = useState<Jornal | null>(null);

  useEffect(() => {
    fetchJornais();
  }, []);

  const fetchJornais = async () => {
    try {
      const data = await adminAPI.getJornais();
      setJornais(data);
    } catch (error) {
      toast.error('Erro ao carregar jornais');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este jornal?')) {
      return;
    }

    try {
      await adminAPI.deleteJornal(id);
      toast.success('Jornal excluído com sucesso!');
      fetchJornais();
    } catch (error) {
      toast.error('Erro ao excluir jornal');
      console.error(error);
    }
  };

  const handleEdit = (jornal: Jornal) => {
    setEditingJornal(jornal);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingJornal(null);
    setModalOpen(true);
  };

  const handleView = (jornal: Jornal) => {
    navigate(`/jornal/${jornal.id}`);
  };

  const handleDownload = (jornal: Jornal) => {
    window.open(jornal.arquivopdf, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      <div className="flex justify-between items-center animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Jornais</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie os jornais disponíveis</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="group relative px-6 py-3 bg-gradient-primary text-primary-foreground font-medium rounded-xl hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 flex items-center space-x-2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform" />
          <span className="relative z-10">Novo Jornal</span>
        </button>
      </div>

      {/* Jornais Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {jornais.map((jornal, idx) => (
          <div key={jornal.id} className="group relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 animate-scale-in overflow-hidden" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              {jornal.capa ? (
                <img
                  src={jornal.capa}
                  alt={jornal.titulo}
                  className="h-32 w-full object-cover rounded-xl ring-2 ring-border group-hover:ring-primary transition-all"
                />
              ) : (
                <div className="h-32 w-full bg-muted rounded-xl flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 relative z-10">
              {jornal.titulo}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 relative z-10">
              Publicado em: {formatDate(jornal.data_publicacao)}
            </p>
            
            <div className="flex items-center justify-between relative z-10">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                jornal.is_active 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {jornal.is_active ? 'Ativo' : 'Inativo'}
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(jornal)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  title="Ver no Flipbook"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(jornal)}
                  className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-100 rounded-lg transition-all"
                  title="Baixar PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(jornal)}
                  className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(jornal.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jornais.length === 0 && (
        <div className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum jornal</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando um novo jornal.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateNew}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Jornal
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <CreateJornalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchJornais}
        editingJornal={editingJornal}
      />
    </div>
  );
};

export default JornaisManagement;
