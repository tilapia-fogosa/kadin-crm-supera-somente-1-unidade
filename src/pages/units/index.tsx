
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UnitsTable } from "@/components/units/units-table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { UnitFormData, unitFormSchema } from "@/types/unit-form";
import { UnitFormFields } from "@/components/units/unit-form-fields";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UnitsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<UnitFormData | null>(null);

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "SP",
      postalCode: "",
      phone: "",
      email: "",
    },
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: units, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq('active', true)
        .order("name");

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar unidades",
          description: "Ocorreu um erro ao carregar as unidades. Tente novamente.",
        });
        throw error;
      }

      return data;
    },
  });

  const handleSubmit = async (values: UnitFormData) => {
    setPendingValues(values);
    setShowConfirmDialog(true);
  };

  const confirmCreate = async () => {
    if (!pendingValues || !session?.user) return;

    try {
      const { data: unitData, error: unitError } = await supabase
        .from("units")
        .insert({
          name: pendingValues.name,
          street: pendingValues.street,
          number: pendingValues.number,
          neighborhood: pendingValues.neighborhood,
          city: pendingValues.city,
          state: pendingValues.state,
          postal_code: pendingValues.postalCode,
          phone: pendingValues.phone,
          email: pendingValues.email,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (unitError) throw unitError;

      const { error: relationError } = await supabase
        .from("unit_users")
        .insert({
          unit_id: unitData.id,
          user_id: session.user.id,
        });

      if (relationError) throw relationError;

      // Invalidar o cache para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: ["units"] });

      toast({
        title: "Unidade criada com sucesso!",
        description: "A nova unidade foi cadastrada.",
      });

      // Reset form and close dialogs
      form.reset();
      setShowConfirmDialog(false);
      setShowNewDialog(false);
      setPendingValues(null);
    } catch (error) {
      console.error("Error creating unit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar unidade",
        description: "Ocorreu um erro ao criar a unidade. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Unidades</h1>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      <UnitsTable units={units || []} isLoading={isLoading} />

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Unidade</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <UnitFormFields form={form} />
              <div className="flex justify-end gap-4">
                <Button type="submit">
                  Criar Unidade
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset();
                    setShowNewDialog(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar criação</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja mesmo criar a unidade {pendingValues?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreate}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
