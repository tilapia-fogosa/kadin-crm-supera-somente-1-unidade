
import { ContactAttemptForm } from "./ContactAttemptForm"
import { EffectiveContactForm } from "./EffectiveContactForm"
import { SchedulingForm } from "./SchedulingForm"
import { ContactAttempt, EffectiveContact, Scheduling } from "./types"

interface ActivityDetailsProps {
  selectedActivity: string | null
  cardId: string
  onRegisterAttempt: (attempt: ContactAttempt) => Promise<void>
  onRegisterEffectiveContact: (contact: EffectiveContact) => Promise<void>
  onRegisterScheduling?: (scheduling: Scheduling) => Promise<void>
}

export function ActivityDetails({
  selectedActivity,
  cardId,
  onRegisterAttempt,
  onRegisterEffectiveContact,
  onRegisterScheduling
}: ActivityDetailsProps) {
  return (
    <div className="border-l pl-4">
      <h3 className="font-semibold mb-2">Detalhes da Atividade</h3>
      {selectedActivity === 'Tentativa de Contato' ? (
        <ContactAttemptForm
          onSubmit={onRegisterAttempt}
          cardId={cardId}
        />
      ) : selectedActivity === 'Contato Efetivo' ? (
        <EffectiveContactForm
          onSubmit={onRegisterEffectiveContact}
          cardId={cardId}
        />
      ) : selectedActivity === 'Agendamento' && onRegisterScheduling ? (
        <SchedulingForm
          onSubmit={onRegisterScheduling}
          cardId={cardId}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Selecione uma atividade para ver as opções
        </p>
      )}
    </div>
  )
}
