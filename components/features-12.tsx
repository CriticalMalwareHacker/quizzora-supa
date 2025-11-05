'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Brain, PenTool, Users2, Store } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function Features() {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    // ✅ Use your correct image filenames
    const images = {
        'item-1': {
            image: '/Manual.jpg',
            alt: 'Manual quiz creation interface',
        },
        'item-2': {
            image: '/AiQuiz.jpg',
            alt: 'AI powered quiz generation',
        },
        'item-3': {
            image: '/Realtimequiz.jpg',
            alt: 'Real-time quiz session with leaderboard',
        },
        'item-4': {
            image: '/DigiMarketplace.jpg',
            alt: 'Quiz marketplace for sharing and collaboration',
        },
    }

    return (
        <section className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">

                {/* Section Heading */}
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">Powerful Quiz Features</h2>
                    <p className="text-muted-foreground text-base">
                        Everything you need to create, manage, and share engaging quizzes — whether you’re teaching, training, or just having fun.
                    </p>
                </div>

                {/* Grid Section */}
                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">

                    {/* Accordion Section */}
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as ImageKey)}
                        className="w-full space-y-2"
                    >
                        {/* Manual Quiz Maker */}
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <PenTool className="size-4" />
                                    Manual Quiz Maker
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                Create custom quizzes with full control — add your own questions, set timers, and assign scores. Perfect for educators and trainers who want precision.
                            </AccordionContent>
                        </AccordionItem>

                        {/* AI-Powered Quiz */}
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Brain className="size-4" />
                                    AI-Powered Quiz
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                Generate quizzes instantly with AI. Just provide a topic or upload content — our smart system creates adaptive questions for your audience.
                            </AccordionContent>
                        </AccordionItem>

                        {/* Real-Time Quizzes */}
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Users2 className="size-4" />
                                    Real-Time Quizzes
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                Host live quiz sessions with real-time feedback, leaderboards, and instant results. Ideal for classrooms, events, or corporate learning.
                            </AccordionContent>
                        </AccordionItem>

                        {/* Quiz Marketplace */}
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Store className="size-4" />
                                    Quiz Marketplace
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                Explore, buy, or share quizzes with other creators. The marketplace connects learners, teachers, and quiz enthusiasts worldwide.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Dynamic Image Section */}
                    <div className="relative flex overflow-hidden rounded-3xl">
                        <div className="aspect-[4/3] relative w-full rounded-2xl overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                >
                                    <Image
                                        src={images[activeItem].image}
                                        alt={images[activeItem].alt}
                                        fill
                                        className="object-cover w-full h-full"
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
