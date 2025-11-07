<h1 align="center">Quizzora</h1>

<p align="center">
<strong>Create, share, and play quizzes in minutes.</strong>
<br>
Quizzora is a full-stack, AI-powered quiz-building application built with Next.js and Supabase.
</p>

<p align="center">
</p>

## ✨ Features

Quizzora is a feature-rich platform that demonstrates a complete, modern web application workflow:

  * **🤖 AI Quiz Generation:** Instantly create quizzes from a simple text prompt using the OpenAI API (gpt-4o-mini). The AI generates a title, questions, 4 multiple-choice options, a correct answer, and even an image suggestion for each question.
  * **🧑‍🎨 Manual Quiz Creator:** A full-featured editor to manually create and edit quizzes. Add a title, upload a custom cover image, and build out questions with text, options, and question-specific images.
  * **🔒 Authentication:** Secure user authentication (sign-up, sign-in, password reset) handled by Supabase Auth. Supports both email/password and Google OAuth.
  * **🚀 Quiz Hosting & Sharing:** Host your created quizzes and share them via a unique, shareable link or a scannable QR code.
  * **🎮 Interactive Quiz Player:** A clean, multi-step form for users to play quizzes. It asks for a player's name to identify them on the leaderboard.
  * **📈 Live Leaderboards:** View results on a live-polling (5-second refresh) leaderboard for any quiz you're hosting.
  * **📝 Results & Review:** After completing a quiz, users see their score (e.g., "8/10") and percentage, along with a detailed review of their answers against the correct ones.
  * **👤 User Profile & Stats:** A dedicated user profile page where users can update their public information (username, full name, location) and view their stats, such as "Quizzes Created" and "Quizzes Played".
  * **🎨 Dashboard & UI:** Built with **shadcn/ui** and **Tailwind CSS**, featuring a beautiful 3D card layout for the quiz list and a light/dark mode theme switcher.
  * **🌐 Public Landing Page:** A fully animated, responsive landing page to attract new users, complete with feature, pricing, and testimonial sections.

## 🔧 Tech Stack

  * **Framework:** [Next.js](https://nextjs.org/) (App Router)
  * **Backend & Database:** [Supabase](https://supabase.com/)
      * **Auth:** Supabase Auth (including SSR)
      * **Database:** Supabase Postgres
      * **Storage:** Supabase Storage (for cover & question images)
  * **AI:** [OpenAI API](https://openai.com/) (gpt-4o-mini)
  * **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  * **Animations:** [Framer Motion (motion/react)](https://www.framer.com/motion/)
  * **Icons:** [Tabler Icons](https://tabler-icons.io/) & [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1\. Clone the Repository

```bash
git clone https://github.com/criticalmalwarehacker/quizzora-supa.git
cd quizzora-supa
```

### 2\. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3\. Set up Supabase

1.  Go to [database.new](https://database.new) and create a new Supabase project.
2.  Navigate to your project's **SQL Editor**.
3.  Run the SQL script below to create the necessary tables (`quizzes`, `quiz_submissions`) and storage bucket (`quiz_covers`).

### 4\. Environment Variables

Rename `.env.example` (if one exists) or create a new file named `.env.local` in the project root. Add the following environment variables:

```env
# Get these from your Supabase project's API settings
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Get this from your OpenAI account
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

  * The `OPENAI_API_KEY` is required for the AI quiz generation feature.

### 5\. Run the Development Server

```bash
npm run dev
```

The app should now be running on [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000/).

-----

## 🐘 Supabase Database Setup

Use the following SQL in your Supabase SQL Editor to set up the required tables, storage, and policies.

```sql
-- 1. CREATE TABLE for quizzes
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  questions jsonb,
  cover_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. CREATE TABLE for quiz submissions
CREATE TABLE public.quiz_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be NULL for guest players
  player_name text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. CREATE STORAGE BUCKET for quiz images
-- Make sure this bucket is set to "Public"
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz_covers', 'quiz_covers', true);

-- 4. ENABLE Row Level Security (RLS)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES for 'quizzes' table
CREATE POLICY "Allow public read access to quizzes"
  ON public.quizzes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert quizzes"
  ON public.quizzes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow owners to update their quizzes"
  ON public.quizzes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owners to delete their quizzes"
  ON public.quizzes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. CREATE RLS POLICIES for 'quiz_submissions' table
CREATE POLICY "Allow public read access to submissions"
  ON public.quiz_submissions
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert a submission"
  ON public.quiz_submissions
  FOR INSERT WITH CHECK (true);

-- 7. CREATE RLS POLICIES for 'quiz_covers' storage
CREATE POLICY "Allow public read access to quiz covers"
  ON storage.objects
  FOR SELECT USING (bucket_id = 'quiz_covers');

CREATE POLICY "Allow authenticated users to upload to their own folder"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'quiz_covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow owners to update their files"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'quiz_covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow owners to delete their files"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'quiz_covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```