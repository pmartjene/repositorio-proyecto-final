import { FormData } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, FileText, Plus, List, Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type DashboardProps = {
  forms: FormData[];
  onEdit: (form: FormData) => void;
  onDelete: (id: string) => void;
  onNewForm: () => void;
  onShowList: () => void;
};

export const Dashboard = ({
  forms,
  onEdit,
  onDelete,
  onNewForm,
  onShowList
}: DashboardProps) => {
  const recentForms = [...forms].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3);
  const lastForm = recentForms[0];

  return (
    <div className="space-y-6">
      {/* Quick Stats - Más compactas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="py-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Formularios</CardTitle>
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <div className="text-xl font-bold">{forms.length}</div>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Último Creado</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <div className="text-xl font-bold">
              {lastForm ? format(lastForm.createdAt, "d MMM", { locale: es }) : "-"}
            </div>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cliente Reciente</CardTitle>
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <div className="text-xl font-bold truncate">
              {lastForm?.fields.nombre || "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona tus formularios</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 pt-0">
          <Button onClick={onNewForm}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Formulario
          </Button>
          <Button onClick={onShowList} variant="outline">
            <List className="w-4 h-4 mr-2" />
            Ver Todos los Formularios
          </Button>
        </CardContent>
      </Card>

      {/* Formularios Recientes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-lg">Formularios Recientes</CardTitle>
          </div>
          <CardDescription>Los últimos 3 formularios creados</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {recentForms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay formularios todavía
            </p>
          ) : (
            <div className="space-y-2">
              {recentForms.map((form) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onEdit(form)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {form.fields.nombre || `Formulario #${form.number}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(form.createdAt, "d MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(form); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};