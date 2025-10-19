import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Jonathan Yombo',
        role: 'Corporate Trainer',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        quote: 'Quizzora is really extraordinary. The AI integration saves me hours on creating training materials. A real gold mine for educators!',
    },
    {
        name: 'Yves Kalume',
        role: 'EdTech Influencer',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        quote: 'With no experience in instructional design, I just created an entire interactive course assessment in a few minutes thanks to Quizzora.',
    },
    {
        name: 'Yucel Faruksahan',
        role: 'Curriculum Developer',
        image: 'https://randomuser.me/api/portraits/men/7.jpg',
        quote: 'Great work on Quizzora. This is one of the best AI quiz makers that I have seen so far. So intuitive and powerful.',
    },
    {
        name: 'Anonymous author',
        role: 'High School Teacher',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
        quote: "I am really new to making online quizzes and wanted to create some for my class. Quizzora was the only one that was clear from the start. The AI helps generate questions and I could modify them to fit my lesson plan perfectly.",
    },
    {
        name: 'Shekinah Tshiokufila',
        role: 'Senior Software Engineer',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
        quote: 'Quizzora is redefining the standard for online assessments. Its AI provides an easy and efficient way for those who love creating interactive content but may lack the time. I can only recommend this incredible wonder.',
    },
    {
        name: 'Oketa Fred',
        role: 'Fullstack Developer',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        quote: 'I absolutely love Quizzora! The AI-generated questions are incredibly accurate and the platform is easy to use, which makes creating a great-looking quiz a breeze.',
    },
    {
        name: 'Zeki',
        role: 'Founder of StudyApp',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
        quote: "Using Quizzora has been like unlocking a secret teaching superpower. It's the perfect fusion of AI simplicity and pedagogical versatility.",
    },
    {
        name: 'Joseph Kitheka',
        role: 'Online Course Creator',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        quote: 'Quizzora has transformed the way I build my courses. Its AI-powered question generation has significantly accelerated my workflow, allowing me to create unique learning experiences.',
    },
    {
        name: 'Khatab Wedaa',
        role: 'UI/UX Designer',
        image: 'https://randomuser.me/api/portraits/men/10.jpg',
        quote: "Quizzora is an elegant, clean, and responsive AI quiz maker. It's very helpful to get started fast on any educational project.",
    },
    {
        name: 'Rodrigo Aguilar',
        role: 'Bootcamp Instructor',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
        quote: 'I love Quizzora ❤️. The AI-generated question blocks are well-structured, simple to use, and intelligently designed. It makes it really easy to have an effective quiz in no time.',
    },
    {
        name: 'Eric Ampire',
        role: 'Google Developer Expert',
        image: 'https://randomuser.me/api/portraits/men/12.jpg',
        quote: 'Quizzora is the perfect solution for anyone who wants to create a beautiful and functional quiz without any design experience. The AI assistance is easy to use and the results are fantastic.',
    },
    {
        name: 'Roland Tubonge',
        role: 'Software Engineer',
        image: 'https://randomuser.me/api/portraits/men/13.jpg',
        quote: "Quizzora is so well designed that even with very little knowledge of a subject, the AI can help you create miracles. Let yourself be seduced by effortless quiz creation!",
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold">Loved by Educators and Creators</h2>
                        {/* THIS IS THE FIXED LINE */}
                        <p className="mt-6 text-muted-foreground">See what people are saying about Quizzora&apos;s AI-powered quiz creation.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div
                                key={chunkIndex}
                                className="space-y-3">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index}>
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                    width="120"
                                                    height="120"
                                                />
                                                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}