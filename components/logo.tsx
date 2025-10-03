import { cn } from '@/lib/utils'
import Image from 'next/image'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/QUIZZORA.png"
            alt="Quizzora Logo"
            width={150}
            height={30}
            className={cn('dark:invert-0 invert h-5 w-auto', className)}
        />
    )
}