'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  BookOpen,
  Brain,
  GraduationCap,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useRef } from 'react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

const FEATURES = [
  {
    title: 'Adaptive Repetitive Learning',
    description:
      'Mistakes come back at the right time so Myanmar students truly master each question.',
    icon: RefreshCw,
  },
  {
    title: 'English Grammar Patterns',
    description:
      'Eleven patterns with trigger words, examples, and instant feedback on every rewrite.',
    icon: BookOpen,
  },
  {
    title: 'Philosophy MCQs + Questions & Answers',
    description:
      'Philo Major papers — aesthetics, history, culture, ethics — with MCQs and questions & answers.',
    icon: GraduationCap,
  },
  {
    title: 'Propositional Logic',
    description:
      'Interactive truth tables and quantification practice for formal logic exams.',
    icon: Brain,
  },
] as const

const STEPS = [
  {
    step: '1',
    title: 'Pick a topic',
    description: 'English grammar, Philo papers, or logic — start where you need it most.',
  },
  {
    step: '2',
    title: 'Practice & get feedback',
    description: 'Type answers, fill tables, flip flashcards. Wrong answers are saved.',
  },
  {
    step: '3',
    title: 'Review until mastered',
    description: 'ConceptBridge requeues mistakes so you improve steadily before exam day.',
  },
] as const

/**
 * ConceptBridge marketing landing page (mobile-first).
 */
export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:h-16 md:px-6">
          <Link href="/" className="text-base font-bold tracking-tight md:text-lg">
            ConceptBridge
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="h-11 min-h-[44px] px-3">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild className="h-11 min-h-[44px] px-3 sm:px-4">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.12),_transparent_55%)]" />

          {/* Floating shapes */}
          <motion.div
            className="pointer-events-none absolute right-6 top-24 hidden h-20 w-20 rounded-2xl bg-primary/15 md:block"
            animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute left-8 top-40 hidden h-14 w-14 rounded-full bg-accent md:block"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative mx-auto max-w-5xl">
            <FadeIn>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Built for Myanmar exam students
              </p>
              <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Learn English and Philosophy — Smarter.
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                ConceptBridge adapts to your mistakes and helps you master grammar,
                essays, and logic through repetitive learning.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-12 min-h-[44px] w-full sm:w-auto">
                  <Link href="/auth/sign-up">Get started free</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 min-h-[44px] w-full sm:w-auto"
                >
                  <Link href="/auth/login?guest=1">Try as guest</Link>
                </Button>
              </div>
            </FadeIn>

            {/* Floating cards preview */}
            <div className="relative mt-12 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Modal Auxiliaries', hint: 'perhaps → may/might' },
                { label: 'Western Aesthetics', hint: 'Paper 3101 MCQ' },
                { label: 'Truth Table', hint: 'P ∨ Q → contingency' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  className="rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Layers className="mb-2 h-5 w-5 text-primary" aria-hidden />
                  <p className="font-medium">{card.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.hint}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/30 px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Everything you need to prepare
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                One place for English writing skills and Philo Major content —
                designed for phone-first study sessions.
              </p>
            </FadeIn>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <FadeIn key={feature.title} delay={i * 0.08}>
                    <div className="h-full rounded-xl border border-border bg-card p-5">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                How it works
              </h2>
            </FadeIn>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((item, i) => (
                <FadeIn key={item.step} delay={i * 0.1}>
                  <li className="relative">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {item.step}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </li>
                </FadeIn>
              ))}
            </ol>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-4 pb-16 md:px-6 md:pb-24">
          <FadeIn>
            <div className="mx-auto max-w-5xl rounded-2xl bg-primary px-6 py-10 text-primary-foreground md:px-10 md:py-14">
              <h2 className="text-2xl font-bold md:text-3xl">
                Ready to study smarter?
              </h2>
              <p className="mt-2 max-w-lg text-primary-foreground/85">
                Create a free account — or try as a guest first. Your streak and
                rank grow as you practice.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 min-h-[44px] w-full sm:w-auto"
                >
                  <Link href="/auth/sign-up">Create account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 min-h-[44px] w-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-foreground">ConceptBridge</p>
          <p>© 2026 ConceptBridge. Built for Myanmar learners.</p>
        </div>
      </footer>
    </div>
  )
}
