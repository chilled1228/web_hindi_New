import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { History } from "lucide-react"
import { PromptHistory } from "./prompt-history"

export function HistoryDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-3xl max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Prompt History</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-4 scrollbar-stable">
          <PromptHistory />
        </div>
      </DialogContent>
    </Dialog>
  )
} 