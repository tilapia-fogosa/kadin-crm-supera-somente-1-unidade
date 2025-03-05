
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/types/enrollment";
import { useUnit } from "@/contexts/UnitContext";

export function useEnrollments() {
  console.log('Iniciando hook useEnrollments');
  const { selectedUnitId } = useUnit();

  return useQuery({
    queryKey: ['enrollments', selectedUnitId],
    queryFn: async () => {
      console.log('Buscando matrículas para unidade:', selectedUnitId);
      
      if (!selectedUnitId) {
        console.log('Nenhuma unidade selecionada');
        return [];
      }

      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          clients (
            lead_source,
            phone_number
          )
        `)
        .eq('unit_id', selectedUnitId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar matrículas:', error);
        throw error;
      }

      // Transformar apenas birth_date para Date, manter created_at e updated_at como string
      const transformedStudents = students.map(student => ({
        ...student,
        birth_date: new Date(student.birth_date),
      }));

      console.log('Matrículas encontradas:', transformedStudents);
      return transformedStudents as (Student & {
        clients: {
          lead_source: string;
          phone_number: string;
        };
      })[];
    },
    enabled: !!selectedUnitId
  });
}
