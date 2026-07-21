"use client";

import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Software Engineer @ Google",
      content:
        "The AI Coach on this platform completely changed how I prepare for interviews. Instead of just giving me the answer, it guided me to find the optimal solution.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "CS Student",
      content:
        "I love how it syncs with my LeetCode and Codeforces profiles. It gives me a unified dashboard to track all my progress and identify my weak topics easily.",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "Frontend Developer",
      content:
        "The UI is gorgeous and the editor is blazingly fast. The company roadmaps helped me focus on exactly what I needed to study for my upcoming interviews.",
      rating: 5,
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by Developers
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            See what others are saying about their experience with codeMonk.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-3xl bg-secondary/20 p-8 shadow-sm border border-border/50"
            >
              <div className="mb-6 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-8 text-muted-foreground leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div className="mt-auto">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
