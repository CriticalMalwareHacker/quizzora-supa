import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from '@/components/header'
import Features from '@/components/features-12'
import WallOfLoveSection from '@/components/testimonials'
import Pricing from '@/components/pricing'
import FooterSection from '@/components/footer' // <-- 1. IMPORTED FOOTER

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                    Quizzora - Your Quiz Maker
                                </TextEffect>

                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                    Create, share, and play quizzes in minutes. Quizzora makes learning and fun come together seamlessly.
                                </TextEffect>

                                {/* ✅ Rectangular Buttons */}
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4"
                                >
                                    {/* White Button (Sign Up Style) */}
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-md px-6 py-2.5 text-base font-semibold bg-white text-black border border-gray-300 hover:bg-gray-100 transition-all duration-200 shadow-sm">
                                        <Link href="/auth/sign-up">
                                            Make your first quiz!
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        {/* ✅ Updated Hero Image Section - Fills Fully, No Black Border */}
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                        >
                            <div className="relative mt-10 overflow-hidden px-2 sm:mt-16 md:mt-20">
                                <div className="mx-auto max-w-6xl overflow-hidden rounded-xl">
                                    <Image
                                        src="/quizhero.jpg"
                                        alt="app screen"
                                        width={2700}
                                        height={1440}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>

                <section id="Features">
                    <Features />
                </section>

                <section id="Pricing">
                    <Pricing />
                </section>

                <section id="WallOfLoveSection">
                    <WallOfLoveSection />
                </section>
            </main>
            <FooterSection /> {/* <-- 2. ADDED FOOTER COMPONENT */}
        </>
    )
}