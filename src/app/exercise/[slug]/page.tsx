import { notFound } from "next/navigation";
import { getExercise, getNextExercise, getPrevExercise } from "@/lib/exercises";
import ExerciseForm from "@/components/ExerciseForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ExercisePage({ params }: Props) {
  const { slug } = await params;
  const exercise = getExercise(slug);

  if (!exercise) {
    notFound();
  }

  const prevSlug = getPrevExercise(slug);
  const nextSlug = getNextExercise(slug);

  // Insert "compass" after motivation-switches and before three-wins
  // and "reflection" after theme
  let resolvedNext = nextSlug;
  let resolvedPrev = prevSlug;

  if (slug === "motivation-switches") {
    resolvedNext = "compass";
  }
  if (slug === "three-wins" && !prevSlug) {
    resolvedPrev = "compass";
  }
  if (slug === "theme") {
    resolvedNext = "reflection";
  }

  return (
    <ExerciseForm
      exercise={exercise}
      prevSlug={resolvedPrev}
      nextSlug={resolvedNext}
    />
  );
}

// Generate static params for all exercises
export { generateStaticParams } from "./generateStaticParams";
