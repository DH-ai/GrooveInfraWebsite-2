import SectionHead from '@/components/ui/SectionHead'
import AnimatedSection from '@/components/ui/AnimatedSection'
import type { Testimonial } from '@/types/project'
import { distinctCredit, formatCategory } from '@/lib/utils'

interface TestimonialsProps {
  testimonials: Testimonial[]
}

/**
 * Client quotes, all of them, at once.
 *
 * This was a one-at-a-time carousel: previous and next buttons, a dot for each
 * quote, a slide transition, and eleven quotes hidden behind twelve clicks. A
 * testimonial is evidence, and hiding evidence behind a control is a strange
 * thing to do with it — particularly when the visitor has no way of knowing
 * whether the next one is worth the click.
 *
 * Set as a ruled list, every quote is readable in one pass, the section needs no
 * client JavaScript, and the attribution sits with the words instead of under a
 * pair of arrows.
 */
export default function Testimonials({ testimonials }: TestimonialsProps) {
  if (!testimonials.length) return null

  return (
    <section className="section-y gutter border-t border-subtle bg-base">
      <div className="mx-auto w-full max-w-[100rem]">
        <SectionHead
          index="04"
          label="In their words"
          title="What clients said afterwards."
          aside={`${testimonials.length} ${testimonials.length === 1 ? 'client' : 'clients'}`}
        />

        <div className="mt-14 grid grid-cols-1 gap-x-16 lg:grid-cols-2">
          {testimonials.map((testimonial, i) => (
            <AnimatedSection key={`${testimonial.client}-${i}`} delay={Math.min(i * 0.05, 0.2)}>
              <figure className="flex h-full flex-col border-t border-subtle py-9">
                <blockquote className="measure font-display text-lede font-medium text-primary">
                  {/*
                    Real typographic quotation marks, hung outside the measure so
                    the first word still lines up with everything below it.
                  */}
                  <span aria-hidden="true" className="-ml-[0.45em] text-muted-custom">
                    &ldquo;
                  </span>
                  {testimonial.text}
                  <span aria-hidden="true" className="text-muted-custom">
                    &rdquo;
                  </span>
                </blockquote>

                <figcaption className="mt-6 text-meta">
                  <span className="font-medium text-primary">{testimonial.client}</span>
                  <span className="mt-1 block text-muted-custom">
                    {[
                      distinctCredit(testimonial.client, testimonial.project),
                      formatCategory(testimonial.category),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </figcaption>
              </figure>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
