import { EXERCISE_ORDER } from "@/lib/exercises";

export function generateStaticParams() {
  return EXERCISE_ORDER.map((slug) => ({ slug }));
}
