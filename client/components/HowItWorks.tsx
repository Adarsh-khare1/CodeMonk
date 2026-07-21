"use client";

import { CheckCircle2, Code2, LineChart, MessageSquare } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Pick a Curated Problem",
      description:
        "Select from our carefully curated list of algorithmic and data structure problems ranging from Easy to Hard.",
      icon: <Code2 className="h-6 w-6 text-primary" />,
    },
    {
      title: "2. Write & Test Your Code",
      description:
        "Use our built-in code editor to write solutions. Run test cases instantly with our integrated Judge0 execution engine.",
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    },
    {
      title: "3. Get AI Feedback",
      description:
        "Stuck or want to optimize? Chat with our AI Coach to get hints, code reviews, and alternative cleaner solutions.",
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
    },
    {
      title: "4. Track Your Progress",
      description:
        "Sync your LeetCode and Codeforces accounts. Watch your global rankings and consistency streak grow on your dashboard.",
      icon: <LineChart className="h-6 w-6 text-orange-500" />,
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-secondary/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How code<span className="text-primary">Monk</span> Works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A seamless workflow designed to help you practice effectively and land your dream job.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-3xl bg-card p-6 shadow-sm border border-border/50 hover:border-primary/50 transition-all"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                {step.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
