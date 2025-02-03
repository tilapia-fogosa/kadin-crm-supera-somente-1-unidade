import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format, addDays, setHours, setMinutes, getHours } from "date-fns"
import { Calendar as CalendarIcon, Phone, MessageSquare } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type KanbanColumn = {
  id: string
  title: string
  cards: KanbanCard[]
}

type KanbanCard = {
  id: string
  clientName: string
  leadSource: string
  phoneNumber: string
  activities?: string[]
  labels?: string[]
}

const initialColumns: KanbanColumn[] = [
  {
    id: "novo-cadastro",
    title: "Novo Cadastro",
    cards: [
      {
        id: "1",
        clientName: "João Silva",
        leadSource: "Site",
        phoneNumber: "5511999999999",
        activities: ["Primeiro Contato"],
        labels: ["novo-lead"],
      },
      {
        id: "2",
        clientName: "Maria Santos",
        leadSource: "Indicação",
        phoneNumber: "5511988888888",
        activities: ["Aguardando Retorno"],
        labels: ["follow-up"],
      },
    ],
  },
  {
    id: "tentativa-contato",
    title: "Em tentativa de Contato",
    cards: [
      {
        id: "3",
        clientName: "Pedro Oliveira",
        leadSource: "Instagram",
        phoneNumber: "5511977777777",
        activities: ["Segunda Tentativa"],
        labels: ["em-andamento"],
      },
    ],
  },
  {
    id: "contato-efetivo",
    title: "Contato Efetivo",
    cards: [
      {
        id: "4",
        clientName: "Ana Costa",
        leadSource: "Facebook",
        phoneNumber: "5511966666666",
        activities: ["Interesse Confirmado"],
        labels: ["qualificado"],
      },
    ],
  },
  {
    id: "atendimento-agendado",
    title: "Atendimento Agendado",
    cards: [
      {
        id: "5",
        clientName: "Carlos Ferreira",
        leadSource: "Google Ads",
        phoneNumber: "5511955555555",
        activities: ["Consulta Marcada"],
        labels: ["agendado"],
      },
    ],
  },
  {
    id: "atendimento-realizado",
    title: "Atendimento Realizado",
    cards: [
      {
        id: "6",
        clientName: "Lucia Mendes",
        leadSource: "LinkedIn",
        phoneNumber: "5511944444444",
        activities: ["Pós Atendimento"],
        labels: ["finalizado"],
      },
    ],
  },
]

export function KanbanBoard() {
  const [columns] = useState<KanbanColumn[]>(initialColumns)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [contactType, setContactType] = useState<string>("phone")
  const [nextContactDate, setNextContactDate] = useState<Date>(() => {
    const now = new Date()
    const tomorrow = addDays(now, 1)
    const hour = getHours(now) >= 12 ? 8 : 14
    return setHours(setMinutes(tomorrow, 0), hour)
  })
  const [selectedHour, setSelectedHour] = useState<string>("08")
  const [selectedMinute, setSelectedMinute] = useState<string>("00")

  const handleDateSelect = (event: React.MouseEvent, date: Date) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  const handleWhatsAppClick = (e: React.MouseEvent, phoneNumber: string) => {
    e.stopPropagation()
    const formattedNumber = phoneNumber.replace(/\D/g, '')
    window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}`, '_blank')
  }

  const activities = [
    { id: 'tentativa', label: 'Tentativa de Contato' },
    { id: 'efetivo', label: 'Contato Efetivo' },
    { id: 'agendamento', label: 'Agendamento' },
    { id: 'atendimento', label: 'Atendimento' },
  ]

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
    if (activityId === 'tentativa') {
      const now = new Date()
      const tomorrow = addDays(now, 1)
      const suggestedHour = getHours(now) >= 12 ? "08" : "14"
      setSelectedHour(suggestedHour)
      setSelectedMinute("00")
      setNextContactDate(setHours(setMinutes(tomorrow, 0), parseInt(suggestedHour)))
    }
  }

  const handleDateTimeChange = (date: Date | undefined, hour: string, minute: string) => {
    if (date) {
      const newDate = setHours(setMinutes(date, parseInt(minute)), parseInt(hour))
      setNextContactDate(newDate)
    }
  }

  const handleRegisterAttempt = () => {
    console.log("Registering attempt:", {
      contactType,
      nextContactDate,
      selectedCard,
    })
    // Here you would implement the logic to save the attempt
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel do Consultor</h1>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && handleDateSelect({} as React.MouseEvent, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex w-80 flex-none flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{column.title}</h2>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                {column.cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {column.cards.map((card) => (
                <Dialog key={card.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:bg-accent/5">
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
                              onClick={(e) => handleWhatsAppClick(e, card.phoneNumber)}
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
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Atividades - {card.clientName}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        {activities.map((activity) => (
                          <Button
                            key={activity.id}
                            variant="outline"
                            className={cn(
                              "justify-start",
                              selectedActivity === activity.id && "bg-primary/10"
                            )}
                            onClick={() => handleActivitySelect(activity.id)}
                          >
                            {activity.label}
                          </Button>
                        ))}
                      </div>
                      <div className="border-l pl-4">
                        {selectedActivity === 'tentativa' ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Tipo de Contato</Label>
                              <RadioGroup
                                value={contactType}
                                onValueChange={setContactType}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="phone" id="phone" />
                                  <Label htmlFor="phone">Ligação Telefônica</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                                  <Label htmlFor="whatsapp">Mensagem WhatsApp</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="whatsapp-call" id="whatsapp-call" />
                                  <Label htmlFor="whatsapp-call">Ligação WhatsApp</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label>Próximo Contato</Label>
                              <div className="flex flex-col gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !nextContactDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {nextContactDate ? (
                                        format(nextContactDate, "dd/MM/yyyy")
                                      ) : (
                                        <span>Selecione uma data</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={nextContactDate}
                                      onSelect={(date) => handleDateTimeChange(date, selectedHour, selectedMinute)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <div className="flex gap-2">
                                  <Select
                                    value={selectedHour}
                                    onValueChange={(value) => {
                                      setSelectedHour(value)
                                      handleDateTimeChange(nextContactDate, value, selectedMinute)
                                    }}
                                  >
                                    <SelectTrigger className="w-[110px]">
                                      <SelectValue placeholder="Hora" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => 
                                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                          {i.toString().padStart(2, '0')}:00
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={selectedMinute}
                                    onValueChange={(value) => {
                                      setSelectedMinute(value)
                                      handleDateTimeChange(nextContactDate, selectedHour, value)
                                    }}
                                  >
                                    <SelectTrigger className="w-[110px]">
                                      <SelectValue placeholder="Minuto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['00', '15', '30', '45'].map((minute) => (
                                        <SelectItem key={minute} value={minute}>
                                          {minute}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={handleRegisterAttempt}
                              className="mt-4"
                            >
                              Cadastrar Tentativa
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Selecione uma atividade para ver as opções
                          </p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
