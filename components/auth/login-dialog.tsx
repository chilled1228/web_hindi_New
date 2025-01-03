import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AuthButtons } from "./auth-buttons"
import { useAuth } from '@/app/providers'
import { motion } from "framer-motion"
import { LogIn } from 'lucide-react'

export function LoginDialog() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      setOpen(false)
    }
  }, [user])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-gradient-to-br from-background to-muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold text-center">
              Welcome Back
            </DialogTitle>
            <p className="text-center text-muted-foreground text-sm mt-2">
              Sign in to your account to continue
            </p>
          </DialogHeader>
          <div className="p-6 pt-2">
            <AuthButtons />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 