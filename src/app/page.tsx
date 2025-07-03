"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus, Calendar } from "lucide-react"
import { analytics } from "@/lib/firebase"
import { logEvent } from "firebase/analytics"

// Floating background elements component
function FloatingElements() {
  const [elements, setElements] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])

  useEffect(() => {
    const newElements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 4,
    }))
    setElements(newElements)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute rounded-full bg-lime-400/5 animate-float"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  )
}

// Particle system for interactive effects
function ParticleSystem({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!trigger || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
    }> = []

    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 60,
        maxLife: 60,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--

        const alpha = particle.life / particle.maxLife
        ctx.fillStyle = `rgba(163, 230, 53, ${alpha})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
        ctx.fill()

        if (particle.life <= 0) {
          particles.splice(index, 1)
        }
      })

      if (particles.length > 0) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [trigger])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />
}

export default function HomePage() {
  // Set your manual countdown target date/time here (YYYY-MM-DDTHH:MM:SS format)
  const COUNTDOWN_TARGET = "2025-07-10T12:00:00" // <-- Set your desired target date/time

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [particleTrigger, setParticleTrigger] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Manual countdown timer logic
  useEffect(() => {
    setMounted(true)

    const targetDate = new Date(COUNTDOWN_TARGET)

    const updateTimer = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateTimer()

    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)

    const timer = setInterval(updateTimer, 1000)
    return () => {
      clearInterval(timer)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "page_view")
    }
  }, [])

  const handleWaitlistClick = () => {
    setParticleTrigger(true)
    setTimeout(() => setParticleTrigger(false), 100)
    // Log analytics event
    if (analytics) {
      logEvent(analytics, "waitlist_click")
    }
    // Open Tally form in new tab
    window.open("https://tally.so/r/wAYgXW", "_blank")
  }

  const faqItems = [
    {
      question: "What makes OpenSolo the ideal platform for contributors?",
      answer:
        "OpenSolo streamlines the process of finding, engaging with, and contributing to open-source projects, offering a curated list and tools to enhance your contribution journey.",
    },
    {
      question: "Is it free to join?",
      answer:
        "Yes, OpenSolo is completely free for both contributors and project maintainers. Our mission is to promote open-source collaboration.",
    },
    {
      question: "How do I start contributing?",
      answer:
        "Simply browse our project listings, find one that interests you, and follow the contribution guidelines provided by the project maintainers. We also offer resources to help beginners get started.",
    },
    {
      question: "Do I need experience to contribute?",
      answer:
        "No prior experience is required! Many projects have beginner-friendly tasks, and our community is supportive. We encourage learning by doing.",
    },
    {
      question: "Are there any perks or 'goodies' for active contributors?",
      answer:
        "Yes! While the primary reward is contributing to open source, we occasionally offer exclusive swag, recognition, and early access to new OpenSolo features for our most active and impactful community members. Stay tuned to our community channels for announcements!",
    },
    {
      question: "Can project maintainers also leverage OpenSolo?",
      answer:
        "Absolutely! Project maintainers can list their open-source projects on OpenSolo to attract new contributors, showcase their work, and connect with a wider audience of developers looking to help. We review submissions to ensure they meet our quality and community standards.",
    },
    {
      question: "Where can I find support within the OpenSolo community?",
      answer:
        "We have a vibrant Discord community for real-time support, discussions, and networking. You can also find resources and guides on our platform to help you get started, and connect with other contributors and project maintainers.",
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <>
      <FloatingElements />
      <ParticleSystem trigger={particleTrigger} />

      {/* Cursor follower */}
      <div
        className="fixed w-4 h-4 bg-lime-400/20 rounded-full pointer-events-none z-50 transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: "scale(1)",
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex flex-col items-center px-4 py-12 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-8 relative z-20">
          {/* Logo */}
          <div className="flex justify-center animate-in slide-in-from-top duration-1000">
            <div className="w-16 h-16 bg-lime-400 rounded-2xl flex items-center justify-center hover:scale-110 hover:rotate-3 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl group">
              <img
                src="/logos.png"
                alt="Logo"
                width={45}
                height={45}
                loading="lazy"
                decoding="async"
                className="text-black transition-transform duration-300 group-hover:scale-110"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>

          {/* Available Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 animate-in slide-in-from-top duration-1000 delay-200">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse shadow-sm"></div>
            <span className="font-medium tracking-wide">AVAILABLE IN JULY 2025</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6 animate-in slide-in-from-bottom duration-1000 delay-300">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              <span className="inline-block hover:scale-105 transition-transform duration-300">OpenSolo</span>
              <br />
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
              OpenSolo is a platform made for people who love open-source. It helps you find meaningful projects,
              contribute more easily, and become an important part of the global open-source community.
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-in slide-in-from-bottom duration-1000 delay-500">
            <Button
              onClick={handleWaitlistClick}
              className="bg-lime-400 hover:bg-lime-500 text-black font-semibold px-8 py-3 rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 transform hover:-translate-y-1 group relative overflow-hidden"
            >
              <span className="relative z-10">Join waitlist</span>
              <div className="absolute inset-0 bg-gradient-to-r from-lime-300 to-lime-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>

          {/* Waitlist Count */}
          <p className="text-gray-500 text-sm animate-in fade-in duration-1000 delay-600">
            Join 299+ others on the waitlist
          </p>

          {/* Countdown Timer */}
          <div className="space-y-6 animate-in slide-in-from-bottom duration-1000 delay-700">
          <div className="flex justify-center gap-6 md:gap-8">
            {[
              { value: timeLeft.days.toString().padStart(2, "0"), label: "DAYS" },
              { value: timeLeft.hours.toString().padStart(2, "0"), label: "HOURS" },
              { value: timeLeft.minutes.toString().padStart(2, "0"), label: "MINUTES" },
              { value: timeLeft.seconds.toString().padStart(2, "0"), label: "SECONDS" },
            ].map((item) => (
              <div key={item.label} className="text-center group cursor-pointer">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 transition-all duration-500 group-hover:scale-125 group-hover:text-lime-600 tabular-nums relative">
                  {item.value}
                  <div className="absolute inset-0 bg-lime-400/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-2 group-hover:text-gray-700 transition-colors duration-300">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 animate-pulse" />
              <span className="font-medium tracking-wide">OpenSolo Goes Live In</span>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="pt-16 space-y-6 animate-in slide-in-from-bottom duration-1000 delay-900">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Frequently asked questions</h2>

            <div className="space-y-2 max-w-xl mx-auto">
              {faqItems.map((item, index) => (
                <Collapsible
                  key={index}
                  open={openFaq === index}
                  onOpenChange={(isOpen) => setOpenFaq(isOpen ? index : null)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-white/50 backdrop-blur-sm hover:bg-white/70 rounded-lg transition-all duration-300 hover:shadow-md group border border-gray-100 hover:border-gray-200">
                    <span className="text-gray-900 font-medium pr-4 text-sm md:text-base group-hover:text-gray-800 transition-colors duration-300">
                      {item.question}
                    </span>
                    <Plus
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-all duration-300 ease-in-out ${openFaq === index ? "rotate-45 text-lime-600" : "group-hover:text-gray-700"
                        }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <div className="px-4 pb-4 pt-2">
                      <div className="text-gray-600 text-sm leading-relaxed bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-gray-100 transition-opacity duration-200">
                        {item.answer}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
        

        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-300/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 px-4 relative z-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Footer CTA */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Have an open-source project to share?</h3>
            <p className="text-gray-600">
              Submit your project and be among the first to simplify how your team shares updates across platforms.

            </p>
            <Button
              onClick={() => window.open("https://tally.so/r/n0Y9pP", "_blank")}
              className="bg-lime-400 hover:bg-lime-500 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Publish to OpenSolo
            </Button>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2025 OpenSolo by{" "}
              <a
                href="https://www.linkedin.com/in/tarun-kumar-uttam/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-700 transition-colors duration-200"
              >
                @Tarun
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
