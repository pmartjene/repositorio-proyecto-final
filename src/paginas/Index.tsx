import { useState } from "react";
import { FormEditor } from "@/components/FormEditor";
import { FormList } from "@/components/FormList";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { FileText, Home } from "lucide-react";
import { loadGlobalPositions } from "@/lib/fieldPositions";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { useFormsStorage } from "@/hooks/useFormsStorage";

export type FieldPosition = {
  top: string;
  left: string;
  fontSize: string;
  width?: string;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
};

export type FormData = {
  id: string;
  number: number;
  name: string;
  fields: {
    presupuesto: string;
    factura: string;
    fv: string;
    dia: string;
    mes: string;
    ano: string;
    nombre: string;
    dni: string;
    direccion: string;
    cpostal: string;
    poblacion: string;
    telefono: string;
    movil: string;
    email: string;
    contacto: string;
    acuenta: string;
    observaciones: string;
  };
  positions?: {
    [key: string]: FieldPosition;
  };
  createdAt: Date;
  isFavorite?: boolean;
};

const Index = () => {
  const {
    forms,
    nextNumber,
    isLoaded,
    addOrUpdateForm,
    deleteForm,
    toggleFavorite,
    incrementNextNumber,
  } = useFormsStorage();

  const [currentForm, setCurrentForm] = useState<FormData | null>(null);
  const [showList, setShowList] = useState(false);

  const handleSave = (data: FormData) => {
    addOrUpdateForm(data);
    setCurrentForm(null);
  };

  const handleNewForm = () => {
    const newForm: FormData = {
      id: `form-${Date.now()}`,
      number: nextNumber,
      name: "",
      fields: {
        presupuesto: "",
        factura: "",
        fv: "",
        dia: "",
        mes: "",
        ano: "",
        nombre: "",
        dni: "",
        direccion: "",
        cpostal: "",
        poblacion: "",
        telefono: "",
        movil: "",
        email: "",
        contacto: "",
        acuenta: "",
        observaciones: ""
      },
      positions: loadGlobalPositions(),
      createdAt: new Date()
    };
    incrementNextNumber();
    setCurrentForm(newForm);
    setShowList(false);
  };

  const handleEdit = (form: FormData) => {
    setCurrentForm(form);
    setShowList(false);
  };

  const handleDelete = (id: string) => {
    deleteForm(id);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
  };

  // Mostrar loading mientras se cargan los datos
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Cargando formularios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link para navegación por teclado */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      
      <header className="border-b border-border bg-card shadow-sm" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-foreground">Editor PiRètols</h1>
          </div>
          <div className="flex items-center gap-2">
            {currentForm && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentForm(null)}
                aria-label="Volver al menú principal"
              >
                <Home className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Menú principal</span>
              </Button>
            )}
            <AccessibilitySettings />
          </div>
        </div>
      </header>

      <main 
        id="main-content" 
        className="container mx-auto px-4 py-8" 
        role="main" 
        aria-label="Contenido principal"
      >
        {showList ? (
          <FormList 
            forms={forms} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onBack={() => setShowList(false)} 
            onToggleFavorite={handleToggleFavorite} 
          />
        ) : currentForm ? (
          <FormEditor 
            form={currentForm} 
            onSave={handleSave} 
            onCancel={() => setCurrentForm(null)} 
          />
        ) : forms.length > 0 ? (
          <Dashboard 
            forms={forms} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onNewForm={handleNewForm} 
            onShowList={() => setShowList(true)} 
          />
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-20"
            role="region"
            aria-label="Bienvenida"
          >
            <FileText className="w-20 h-20 text-muted-foreground mb-6" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Bienvenido al Editor PiRètols
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Crea un nuevo formulario para comenzar
            </p>
            <Button 
              size="lg" 
              onClick={handleNewForm} 
              aria-label="Crear el primer formulario"
            >
              <FileText className="w-5 h-5 mr-2" aria-hidden="true" />
              Crear primer formulario
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
