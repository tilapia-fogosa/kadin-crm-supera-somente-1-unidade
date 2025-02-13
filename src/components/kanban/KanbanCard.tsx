
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare, Clock, Calendar } from "lucide-react"
import { KanbanCard as KanbanCardType } from "./types"
import { format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KanbanCardProps {
  card: KanbanCardType
  onClick: () => void
  onWhatsAppClick: (e: React.MouseEvent) => void
}

const formatLastActivity = (activity: string) => {
  const parts = activity.split('|')
  const date = new Date(parts[2])
  return {
    type: `${parts[0]} - ${parts[1]}`,
    date: format(date, 'dd-MM-yy HH:mm')
  }
}

export function KanbanCard({ card, onClick, onWhatsAppClick }: KanbanCardProps) {
  const lastActivity = card.activities && card.activities.length > 0 
    ? formatLastActivity(card.activities[card.activities.length - 1])
    : null

  // Verifica se o último registro é uma tentativa de contato e extrai a data
  const nextContactInfo = lastActivity?.type.startsWith('Tentativa de Contato') 
    ? lastActivity 
    : null

  return (
    <Card className="cursor-pointer hover:bg-accent/5" onClick={onClick}>
      <CardHeader className="p-2 pb-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base -mt-1">{card.clientName}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(card.createdAt), 'dd-MM-yy HH:mm')}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data de cadastro do cliente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {nextContactInfo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {nextContactInfo.date}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Origem: {card.leadSource}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0"
              onClick={onWhatsAppClick}
            >
              <MessageSquare className="h-4 w-4 text-green-500" />
            </Button>
            <Phone className="h-4 w-4" />
            <span className="text-sm">{card.phoneNumber}</span>
          </div>
          {card.labels && (
            <div className="mt-1 flex flex-wrap gap-1">
              {card.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
