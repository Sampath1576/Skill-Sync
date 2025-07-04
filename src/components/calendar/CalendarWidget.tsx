import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface CalendarWidgetProps {
  date: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  highlightedDates?: string[] // Highlighted event dates in 'YYYY-MM-DD' format
}

export function CalendarWidget({ date, onDateSelect, highlightedDates = [] }: CalendarWidgetProps) {
  const { toast } = useToast()

  const handleDateSelect = (newDate: Date | undefined) => {
    onDateSelect(newDate)
    if (newDate) {
      toast({
        title: "Date Selected",
        description: `Selected ${newDate.toDateString()}`,
      })
    }
  }

  const highlightedSet = useMemo(() => new Set(highlightedDates), [highlightedDates])
  const todayISO = new Date().toLocaleDateString('en-CA')

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full">
      <Card className="flex-1 min-h-[420px]">
        <CardHeader className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Schedule</h2>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
            modifiers={{
              highlighted: (day) => {
                const iso = day.toLocaleDateString('en-CA')
                return highlightedSet.has(iso)
              },
            }}
            modifiersClassNames={{
              highlighted: "bg-blue-200 text-black font-semibold",
            }}
          />
        </CardContent>
      </Card>

      
    </div>
  )
}
