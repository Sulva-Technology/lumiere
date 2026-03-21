import { Glass } from '@/components/ui/glass';

interface InfoSection {
  title: string;
  body: string[];
}

export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Glass level="heavy" className="p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-accent)]">{eyebrow}</p>
        <h1 className="headline-strong mt-4 font-serif text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">{intro}</p>
      </Glass>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <Glass key={section.title} level="medium" className="p-6 sm:p-8">
            <h2 className="headline-strong font-serif text-2xl">{section.title}</h2>
            <div className="mt-4 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-[var(--text-secondary)]">
                  {paragraph}
                </p>
              ))}
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
