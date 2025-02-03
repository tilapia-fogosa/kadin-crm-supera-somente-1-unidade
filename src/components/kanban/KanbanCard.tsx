import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare } from "lucide-react"
import { KanbanCard as KanbanCardType } from "./types"

interface KanbanCardProps {
  card: KanbanCardType
  onClick: () => void
  onWhatsAppClick: (e: React.MouseEvent) => void
}

export function KanbanCard({ card, onClick, onWhatsAppClick }: KanbanCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-accent/5" onClick={onClick}>
      <CardHeader className="p-4">
        <CardTitle className="text-base">{card.clientName}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
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
          {card.activities && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground">
                Última atividade:
              </p>
              <p className="text-sm">
                {card.activities[card.activities.length - 1]}
              </p>
            </div>
          )}
          {card.labels && (
            <div className="mt-2 flex flex-wrap gap-1">
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