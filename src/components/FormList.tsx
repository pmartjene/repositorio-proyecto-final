import { useState } from "react";
import { FormData } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, FileText, Home, ChevronRight, FolderOpen, Folder, Search, Star, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "alphabetical" | "date-desc" | "date-asc";

type FormListProps = {
  forms: FormData[];
  onEdit: (form: FormData) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
};

export const FormList = ({ forms, onEdit, onDelete, onBack, onToggleFavorite }: FormListProps) => {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("alphabetical");

  const toggleFolder = (name: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // Filter forms by search term
  const filteredForms = forms.filter((form) => {
    const search = searchTerm.toLowerCase();
    return (
      form.name.toLowerCase().includes(search) ||
      form.fields.nombre?.toLowerCase().includes(search) ||
      form.fields.presupuesto?.toLowerCase().includes(search) ||
      form.fields.factura?.toLowerCase().includes(search)
    );
  });

  // Sort forms based on selected option
  const sortForms = (formsToSort: FormData[]) => {
    return [...formsToSort].sort((a, b) => {
      // Favorites always first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // Then apply the selected sort
      switch (sortOption) {
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  // Group forms by name, or keep ungrouped by number
  const groupedForms = filteredForms.reduce((acc, form) => {
    const key = form.name.trim() || `Sin nombre - ${form.number}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(form);
    return acc;
  }, {} as Record<string, FormData[]>);

  // Sort groups and forms within them
  const sortedGroups = Object.entries(groupedForms)
    .map(([name, groupForms]) => ({
      name,
      forms: sortForms(groupForms),
      hasFavorite: groupForms.some(f => f.isFavorite),
    }))
    .sort((a, b) => {
      // Groups with favorites come first
      if (a.hasFavorite && !b.hasFavorite) return -1;
      if (!a.hasFavorite && b.hasFavorite) return 1;
      // Groups with names come before unnamed
      if (a.name.startsWith("Sin nombre") && !b.name.startsWith("Sin nombre")) return 1;
      if (!a.name.startsWith("Sin nombre") && b.name.startsWith("Sin nombre")) return -1;
      
      // Then apply alphabetical or date sort for groups
      if (sortOption === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      // For date sort, use the most recent form in each group
      if (sortOption === "date-desc") {
        const aDate = Math.max(...a.forms.map(f => new Date(f.createdAt).getTime()));
        const bDate = Math.max(...b.forms.map(f => new Date(f.createdAt).getTime()));
        return bDate - aDate;
      }
      if (sortOption === "date-asc") {
        const aDate = Math.min(...a.forms.map(f => new Date(f.createdAt).getTime()));
        const bDate = Math.min(...b.forms.map(f => new Date(f.createdAt).getTime()));
        return aDate - bDate;
      }
      return a.name.localeCompare(b.name);
    });

  if (forms.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-20"
        role="status"
        aria-label="No hay formularios guardados"
      >
        <FileText className="w-16 h-16 text-muted-foreground mb-4" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No hay formularios guardados
        </h3>
        <p className="text-muted-foreground mb-6">
          Crea un nuevo formulario para comenzar
        </p>
        <Button variant="outline" onClick={onBack}>
          <Home className="w-4 h-4 mr-2" aria-hidden="true" />
          Volver al menú principal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="region" aria-label="Lista de formularios guardados">
      {/* Anunciador para lectores de pantalla */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="form-announcer"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground" id="forms-heading">
          Formularios guardados ({forms.length})
        </h2>
        <Button variant="outline" onClick={onBack} aria-label="Volver al menú principal">
          <Home className="w-4 h-4 mr-2" aria-hidden="true" />
          Menú principal
        </Button>
      </div>

      <div className="flex gap-3 mb-4" role="search" aria-label="Buscar y ordenar formularios">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Buscar por nombre, cliente, presupuesto o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Buscar formularios"
            aria-describedby="search-hint"
          />
          <span id="search-hint" className="sr-only">
            Escribe para filtrar formularios por nombre, cliente, presupuesto o factura
          </span>
        </div>
        <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
          <SelectTrigger className="w-[180px]" aria-label="Ordenar formularios">
            <ArrowUpDown className="w-4 h-4 mr-2" aria-hidden="true" />
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alphabetical">Alfabético (A-Z)</SelectItem>
            <SelectItem value="date-desc">Más recientes</SelectItem>
            <SelectItem value="date-asc">Más antiguos</SelectItem>
            
          </SelectContent>
        </Select>
      </div>

      {sortedGroups.length === 0 && searchTerm && (
        <div 
          className="text-center py-8 text-muted-foreground" 
          role="status" 
          aria-live="polite"
        >
          No se encontraron resultados para "{searchTerm}"
        </div>
      )}

      {sortedGroups.map(({ name, forms }) => {
        const isOpen = openFolders.has(name);
        const hasFavorites = forms.some(f => f.isFavorite);
        const folderId = `folder-${name.replace(/\s+/g, '-')}`;
        return (
          <Collapsible
            key={name}
            open={isOpen}
            onOpenChange={() => toggleFolder(name)}
          >
            <Card className="overflow-hidden" role="group" aria-labelledby={folderId}>
              <div className="flex items-center">
                <CollapsibleTrigger asChild>
                  <button 
                    className="flex-1 p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left focus-visible:ring-inset"
                    aria-expanded={isOpen}
                    aria-controls={`content-${folderId}`}
                    id={folderId}
                  >
                    <ChevronRight
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                      aria-hidden="true"
                    />
                    {isOpen ? (
                      <FolderOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                    ) : (
                      <Folder className="w-5 h-5 text-primary" aria-hidden="true" />
                    )}
                    <span className="font-semibold text-foreground flex-1">
                      {name}
                    </span>
                    <span 
                      className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full"
                      aria-label={`${forms.length} ${forms.length === 1 ? "formulario" : "formularios"}`}
                    >
                      {forms.length} {forms.length === 1 ? "formulario" : "formularios"}
                    </span>
                  </button>
                </CollapsibleTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    forms.forEach(f => {
                      if (hasFavorites && f.isFavorite) {
                        onToggleFavorite(f.id);
                      } else if (!hasFavorites && !f.isFavorite) {
                        onToggleFavorite(f.id);
                      }
                    });
                    // Anunciar cambio para lectores de pantalla
                    const announcer = document.getElementById('form-announcer');
                    if (announcer) {
                      announcer.textContent = hasFavorites 
                        ? `${name} eliminado de favoritos` 
                        : `${name} añadido a favoritos`;
                    }
                  }}
                  aria-label={hasFavorites ? `Quitar ${name} de favoritos` : `Añadir ${name} a favoritos`}
                  aria-pressed={hasFavorites}
                >
                  <Star 
                    className={`w-5 h-5 ${hasFavorites ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
                    aria-hidden="true"
                  />
                </Button>
              </div>

              <CollapsibleContent id={`content-${folderId}`}>
                <div className="border-t p-4">
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    role="list"
                    aria-label={`Formularios en ${name}`}
                  >
                    {forms.map((form) => (
                      <Card 
                        key={form.id} 
                        className="p-4 hover:shadow-lg transition-shadow bg-background"
                        role="listitem"
                        aria-label={`Formulario número ${form.number}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-semibold text-primary mb-1">
                              Formulario #{form.number}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(form.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
                            </div>
                          </div>
                          <div className="flex gap-1" role="group" aria-label="Acciones del formulario">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(form)}
                              aria-label={`Editar formulario número ${form.number}`}
                            >
                              <Edit className="w-4 h-4" aria-hidden="true" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  aria-label={`Eliminar formulario número ${form.number}`}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-desc">
                                <AlertDialogHeader>
                                  <AlertDialogTitle id="delete-title">¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription id="delete-desc">
                                    Esta acción eliminará el formulario #{form.number} de forma permanente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDelete(form.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm">
                          {form.fields.nombre && (
                            <div>
                              <span className="font-medium">Cliente:</span> {form.fields.nombre}
                            </div>
                          )}
                          {form.fields.presupuesto && (
                            <div>
                              <span className="font-medium">Presupuesto:</span> {form.fields.presupuesto}
                            </div>
                          )}
                          {form.fields.factura && (
                            <div>
                              <span className="font-medium">Factura:</span> {form.fields.factura}
                            </div>
                          )}
                          {form.fields.telefono && (
                            <div>
                              <span className="font-medium">Tel:</span> {form.fields.telefono}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};
