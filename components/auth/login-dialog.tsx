import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { AuthButtons } from "./auth-buttons"
import { useAuth } from '@/app/providers'
import { motion, AnimatePresence } from "framer-motion"
import { LogIn, X, ArrowRight } from 'lucide-react'

export function LoginDialog() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      setOpen(false)
    }
  }, [user])

  // Prevent scroll when slide-over is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
      >
        <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="text-sm sm:text-base">Login</span>
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
              style={{ backdropFilter: 'blur(2px)' }}
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[400px] bg-background rounded-lg shadow-lg z-50"
            >
              {/* Close button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setOpen(false)}
                className="absolute right-2 top-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Sign in to access your account
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Benefits */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    {[
                      'Access your saved prompts',
                      'Track your prompt history',
                      'Get personalized recommendations',
                      'Join our community'
                    ].map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Auth buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <AuthButtons />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 