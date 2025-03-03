
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js"
import { useEffect } from "react"
import { useUserUnit } from "./useUserUnit"

export function useClientData() {
  const queryClient = useQueryClient()
  const { data: userUnits } = useUserUnit()

  // Enable realtime subscription when the hook is mounted
  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients'
        },
        (payload: RealtimePostgresInsertPayload<any>) => {
          console.log('New client inserted:', payload)
          // Invalidate all relevant queries
          queryClient.invalidateQueries({ queryKey: ['clients'] })
          queryClient.invalidateQueries({ queryKey: ['activity-dashboard'] })
          queryClient.invalidateQueries({ queryKey: ['scheduled-leads'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clients'
        },
        (payload: RealtimePostgresUpdatePayload<any>) => {
          console.log('Client updated:', payload)
          // Invalidate all relevant queries
          queryClient.invalidateQueries({ queryKey: ['clients'] })
          queryClient.invalidateQueries({ queryKey: ['activity-dashboard'] })
          queryClient.invalidateQueries({ queryKey: ['scheduled-leads'] })
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['clients', userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const unitIds = userUnits?.map(u => u.unit_id) || []
      console.log('Fetching clients data for units:', unitIds)
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          lead_source,
          observations,
          status,
          next_contact_date,
          created_at,
          original_ad,
          original_adset,
          client_activities (
            id,
            tipo_contato,
            tipo_atividade,
            notes,
            created_at,
            next_contact_date,
            active
          )
        `)
        .eq('active', true)
        .in('unit_id', unitIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients:', error)
        throw error
      }

      console.log('Total active clients received from database:', data?.length)
      
      // Log all clients with their next_contact_date for debugging
      data?.forEach(client => {
        console.log('Client data:', {
          id: client.id,
          name: client.name,
          original_ad: client.original_ad,
          original_adset: client.original_adset,
          status: client.status,
          activities_count: client.client_activities?.length || 0
        })
      })

      const clientsWithActivities = data?.map(client => {
        return {
          ...client,
          client_activities: (client.client_activities || [])
            .filter(activity => activity.active)
            .map(activity => {
              return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}|${activity.next_contact_date || ''}|${activity.active}`
            })
        }
      })

      console.log('Total processed active clients:', clientsWithActivities?.length)
      return clientsWithActivities
    },
    enabled: userUnits !== undefined && userUnits.length > 0
  })
}
