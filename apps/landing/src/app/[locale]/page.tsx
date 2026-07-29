import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { setI18n } from '@lingui/react/server';
import { createLandingI18n } from '@lumina/i18n/landing';
import { isSupportedLocale } from '@lumina/i18n';
import { notFound } from 'next/navigation';

import { AndroidCta } from '@/components/android-cta';
import { DevicePreview, type PreviewVariant } from '@/components/device-preview';

type PageProps = { params: Promise<{ locale: string }> };

const workflow: readonly { id: string; number: string; variant: PreviewVariant }[] = [
  { id: 'describe', number: '01', variant: 'night' },
  { id: 'refine', number: '02', variant: 'bloom' },
  { id: 'apply', number: '03', variant: 'aurora' },
];

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setI18n(await createLandingI18n(locale));
  const otherLocale = locale === 'zh-CN' ? 'en' : 'zh-CN';
  const currentYear = new Date().getFullYear();

  return (
    <>
      <a className="skip-link" href="#content">
        <Trans id="landing.skip">Skip to content</Trans>
      </a>
      <header className="site-header">
        <div className="site-header__inner page-container">
          <a aria-label="Lumina" className="wordmark" href="#top">
            Lumina
          </a>
          <nav aria-label="Main navigation" className="site-nav">
            <a href="#workflow">
              <Trans id="landing.nav.workflow">Workflow</Trans>
            </a>
            <a href="#features">
              <Trans id="landing.nav.features">Features</Trans>
            </a>
            <Link href={`/${otherLocale}`}>
              <Trans id="landing.nav.language">中文 / English</Trans>
            </Link>
          </nav>
          <AndroidCta className="android-cta" compact />
        </div>
      </header>
      <main id="content">
        <section className="hero" id="top">
          <div className="hero__grid page-container">
            <div className="hero__copy">
              <p className="hero__eyebrow">
                <Trans id="landing.hero.eyebrow">AI WALLPAPER · MADE PERSONAL</Trans>
              </p>
              <h1>
                <Trans id="landing.hero.title">Make your screen feel like yours.</Trans>
              </h1>
              <p className="hero__summary">
                <Trans id="landing.hero.summary">
                  Start with an idea, then create, refine, and preview a wallpaper made for you.
                </Trans>
              </p>
              <AndroidCta className="android-cta hero__cta" />
              <p className="hero__note">
                <Trans id="landing.hero.note">Made for Android</Trans>
              </p>
            </div>
            <div className="hero__visual">
              <div aria-hidden="true" className="hero__orbit" />
              <DevicePreview
                className="hero__device"
                label="Lumina wallpaper preview"
                variant="aurora"
              />
              <p aria-hidden="true" className="hero__visual-note">
                LUMINA / 01
                <br />
                LIGHT, HELD IN GLASS
              </p>
            </div>
          </div>
        </section>
        <section className="page-section workflow" id="workflow">
          <div className="page-container">
            <div className="section-heading">
              <p className="section-heading__eyebrow">
                <Trans id="landing.workflow.eyebrow">HOW IT FLOWS</Trans>
              </p>
              <h2>
                <Trans id="landing.workflow.title">
                  From an idea to the world you see every day.
                </Trans>
              </h2>
              <p className="section-heading__summary">
                <Trans id="landing.workflow.summary">
                  Three clear steps bring an idea from words to your screen.
                </Trans>
              </p>
            </div>
            <div className="workflow-grid">
              {workflow.map((step) => (
                <WorkflowCard key={step.id} {...step} />
              ))}
            </div>
          </div>
        </section>
        <section className="page-section capabilities" id="features">
          <div className="page-container capabilities__layout">
            <div className="section-heading">
              <p className="section-heading__eyebrow">
                <Trans id="landing.features.eyebrow">WHAT YOU CAN DO</Trans>
              </p>
              <h2>
                <Trans id="landing.features.title">
                  Everything you need to make a screen your own.
                </Trans>
              </h2>
              <p className="section-heading__summary">
                <Trans id="landing.features.summary">
                  A focused toolkit for making, viewing, and keeping your work.
                </Trans>
              </p>
            </div>
            <div className="feature-grid">
              <FeatureCards />
            </div>
          </div>
        </section>
        <section className="closing page-section">
          <div className="closing__panel page-container">
            <p className="closing__eyebrow">
              <Trans id="landing.closing.eyebrow">YOUR SCREEN, YOUR WORLD</Trans>
            </p>
            <h2>
              <Trans id="landing.closing.title">Meet a world you love every time you unlock.</Trans>
            </h2>
            <AndroidCta className="android-cta closing__cta" />
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="page-container site-footer__inner">
          <p>
            <Trans id="landing.footer.tagline">Lumina — AI wallpaper, made personal.</Trans>
          </p>
          <p>© {currentYear} Lumina</p>
        </div>
      </footer>
    </>
  );
}

function WorkflowCard({
  id,
  number,
  variant,
}: {
  id: string;
  number: string;
  variant: PreviewVariant;
}) {
  const content = {
    apply: {
      description: (
        <Trans id="landing.workflow.apply.description">
          Preview the result, then save, share, or apply it to Android.
        </Trans>
      ),
      title: <Trans id="landing.workflow.apply.title">Preview and apply</Trans>,
    },
    describe: {
      description: (
        <Trans id="landing.workflow.describe.description">
          Write down color, light, and mood to give an idea a place to start.
        </Trans>
      ),
      title: <Trans id="landing.workflow.describe.title">Describe an idea</Trans>,
    },
    refine: {
      description: (
        <Trans id="landing.workflow.refine.description">
          Keep describing changes, or start with an image and make it feel more like you.
        </Trans>
      ),
      title: <Trans id="landing.workflow.refine.title">Refine the details</Trans>,
    },
  }[id] as { description: React.ReactNode; title: React.ReactNode };

  return (
    <article className="workflow-card">
      <div className="workflow-card__copy">
        <p className="workflow-card__number">{number}</p>
        <h3>{content.title}</h3>
        <p>{content.description}</p>
      </div>
      <DevicePreview
        className="workflow-card__preview"
        label="Wallpaper workflow preview"
        variant={variant}
      />
    </article>
  );
}

function FeatureCards() {
  return (
    <>
      <article className="feature-card">
        <p className="feature-card__eyebrow">CREATE</p>
        <h3>
          <Trans id="landing.feature.create.title">Turn a sentence into a wallpaper.</Trans>
        </h3>
        <p>
          <Trans id="landing.feature.create.description">
            Create from a text idea and let color, texture, and mood take shape.
          </Trans>
        </p>
      </article>
      <article className="feature-card">
        <p className="feature-card__eyebrow">EDIT</p>
        <h3>
          <Trans id="landing.feature.edit.title">Take an existing image further.</Trans>
        </h3>
        <p>
          <Trans id="landing.feature.edit.description">
            Choose an image, describe the change, and give familiar material a new expression.
          </Trans>
        </p>
      </article>
      <article className="feature-card">
        <p className="feature-card__eyebrow">PREVIEW</p>
        <h3>
          <Trans id="landing.feature.preview.title">See the final effect on a screen first.</Trans>
        </h3>
        <p>
          <Trans id="landing.feature.preview.description">
            Check the composition in a device-shaped preview before you apply it.
          </Trans>
        </p>
      </article>
      <article className="feature-card">
        <p className="feature-card__eyebrow">KEEP</p>
        <h3>
          <Trans id="landing.feature.keep.title">Save it, share it, and come back anytime.</Trans>
        </h3>
        <p>
          <Trans id="landing.feature.keep.description">
            Keep favorite work on your device, share it with friends, or revisit it in your library.
          </Trans>
        </p>
      </article>
    </>
  );
}
