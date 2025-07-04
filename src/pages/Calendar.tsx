import { Header } from "@/components/Header"
import { AppSidebar } from "@/components/AppSidebar"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { CalendarWidget } from "@/components/calendar/CalendarWidget"
import { EventList } from "@/components/calendar/EventList"
import { EventForm } from "@/components/calendar/EventForm"
import { useLocalEvents } from "@/hooks/useLocalEvents"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader as CardHeaderUI, CardTitle as CardTitleUI } from "@/components/ui/card"

interface EventFormData {
  title: string
  description: string
  event_date: string
  event_time: string
  attendees: number
}

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([])
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  const { events, createEvent, updateEvent, deleteEvent } = useLocalEvents()

  const handleAddEvent = async (eventData: EventFormData) => {
    await createEvent(eventData)
    setIsAddEventOpen(false)
  }

  const handleUpdateEvent = async (eventId: string, eventData: EventFormData) => {
    await updateEvent(eventId, eventData)
    setEditingEvent(null)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
  }

  const handleCloseEditDialog = () => {
    setEditingEvent(null)
  }

  const handleOpenAddDialog = () => {
    setIsAddEventOpen(true)
  }

  const handleCloseAddDialog = () => {
    setIsAddEventOpen(false)
  }

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return

    const selectedDateStr = selected.toLocaleDateString('en-CA') // format: YYYY-MM-DD
    const filteredEvents = events.filter(event => event.event_date === selectedDateStr)

    if (filteredEvents.length > 0) {
      setDate(selected)
      setSelectedDateEvents(filteredEvents)
      setIsEventDialogOpen(true)
    }
  }

  const eventDates = useMemo(() => {
    return events.map(event => event.event_date)
  }, [events])

  const todayStr = new Date().toLocaleDateString('en-CA')
  const todayEvents = events.filter(event => event.event_date === todayStr)
  const nextEvent = todayEvents
    .map(event => ({
      ...event,
      datetime: new Date(`${event.event_date}T${event.event_time}`)
    }))
    .filter(event => event.datetime > new Date())
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())[0]

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Calendar</h1>
                <p className="text-muted-foreground mt-1">Manage your schedule and events</p>
              </div>
              <Button className="gap-2" onClick={handleOpenAddDialog}>
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <CalendarWidget 
                date={date} 
                onDateSelect={handleDateSelect} 
                highlightedDates={eventDates} 
              />

              

              <EventList 
                events={events}
                onEditEvent={handleEditEvent}
                onDeleteEvent={deleteEvent}
              />
              <div className="lg:col-span-1">
                <Card>
                  <CardHeaderUI>
                    <CardTitleUI>Today's Summary</CardTitleUI>
                  </CardHeaderUI>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>📆 You have <strong>{todayEvents.length}</strong> event(s) today.</p>
                    {todayEvents.length > 0 && (
                      <>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                          {todayEvents.map((event, idx) => (
                            <li key={idx}>{event.title}</li>
                          ))}
                        </ul>
                        {nextEvent ? (
                          <p>⏰ Next: <strong>{nextEvent.title}</strong> at <strong>{nextEvent.event_time}</strong></p>
                        ) : (
                          <p>✅ All events for today are done!</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <EventForm
              trigger={<div />}  
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onClose={handleCloseAddDialog}
              isOpen={isAddEventOpen}
            />

            {editingEvent && (
              <EventForm
                trigger={<div />}  
                isEdit={true}
                editingEvent={editingEvent}
                onAddEvent={handleAddEvent}
                onUpdateEvent={handleUpdateEvent}
                onClose={handleCloseEditDialog}
                isOpen={!!editingEvent}
              />
            )}

            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Events on {date?.toDateString()}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events on this date.</p>
                  ) : (
                    selectedDateEvents.map((event, idx) => (
                      <div key={idx} className="border p-3 rounded shadow">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.event_time} • {event.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
