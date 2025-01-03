'use client'

import { SignIn } from "@clerk/nextjs"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0">
        <SignIn afterSignInUrl={window.location.href} routing="hash" />
      </DialogContent>
    </Dialog>
  )
} 