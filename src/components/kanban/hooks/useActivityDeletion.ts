
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useActivityDeletion() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteActivity = async (activityId: string, clientId: string) => {
    try {
      console.log('Iniciando processo de inativação:', { activityId, clientId });
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        console.error('Usuário não autenticado');
        throw new Error('Não autorizado: usuário não autenticado');
      }
      
      // Atualiza diretamente o status da atividade para inativo
      const { data: updatedActivity, error: updateError } = await supabase
        .from('client_activities')
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao inativar atividade:', updateError);
        throw updateError;
      }

      if (!updatedActivity) {
        throw new Error('Falha ao inativar atividade: atividade não encontrada');
      }

      console.log('Atividade inativada com sucesso:', updatedActivity);

      await queryClient.invalidateQueries({ queryKey: ['clients'] });

      toast({
        title: "Atividade excluída",
        description: "A atividade foi inativada com sucesso",
      })
    } catch (error) {
      console.error('Erro em deleteActivity:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir atividade",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar inativar a atividade.",
      })
    }
  }

  return { deleteActivity }
}
