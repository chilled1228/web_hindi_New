'use client'

import { SignIn } from "@clerk/nextjs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [returnUrl, setReturnUrl] = useState<string>("")

  useEffect(() => {
    setReturnUrl(window.location.href)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0">
        <SignIn afterSignInUrl={returnUrl} routing="hash" />
      </DialogContent>
    </Dialog>
  )
} 