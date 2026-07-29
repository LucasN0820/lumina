import { AndroidCta } from '@/components/android-cta';
import { DevicePreview, type PreviewVariant } from '@/components/device-preview';
import { FeatureCard } from '@/components/feature-card';
import { SectionHeading } from '@/components/section-heading';

type WorkflowStep = {
  description: string;
  englishTitle: string;
  number: string;
  title: string;
  variant: PreviewVariant;
};

const workflowSteps = [
  {
    number: '01',
    title: '描述灵感',
    englishTitle: 'Describe',
    description: '写下颜色、光线与氛围，让一个念头成为壁纸的起点。',
    variant: 'night',
  },
  {
    number: '02',
    title: '细致调整',
    englishTitle: 'Refine',
    description: '继续描述变化，或从已有图片出发，把画面调整到更像你。',
    variant: 'bloom',
  },
  {
    number: '03',
    title: '预览并应用',
    englishTitle: 'Preview & apply',
    description: '在设备画框中确认效果，再保存、分享或应用到 Android 屏幕。',
    variant: 'aurora',
  },
] as const satisfies readonly WorkflowStep[];

const capabilities = [
  {
    eyebrow: 'CREATE / 生成',
    title: '把一句描述，变成一张壁纸。',
    description: '用 AI 从文字灵感开始创作，让色彩、质感和氛围逐渐清晰。',
  },
  {
    eyebrow: 'EDIT / 编辑',
    title: '从已有画面，继续向前。',
    description: '选择已有图片并描述想要的变化，让熟悉的素材拥有新的表达。',
  },
  {
    eyebrow: 'PREVIEW / 预览',
    title: '先在屏幕里，看见最终效果。',
    description: '用贴近设备比例的预览检查构图，再决定如何应用到 Android。',
  },
  {
    eyebrow: 'KEEP / 留存',
    title: '保存、分享，也随时回来看看。',
    description: '把喜欢的作品保存到设备、分享给朋友，或留在作品库中继续使用。',
  },
] as const;

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <a className="skip-link" href="#content">
        跳到主要内容
      </a>
      <header className="site-header">
        <div className="site-header__inner page-container">
          <a aria-label="Lumina 首页" className="wordmark" href="#top">
            Lumina
          </a>
          <nav aria-label="主要导航" className="site-nav">
            <a href="#workflow">创作流程 / Workflow</a>
            <a href="#features">功能 / Features</a>
          </nav>
          <AndroidCta className="android-cta" compact />
        </div>
      </header>

      <main id="content">
        <section className="hero" id="top">
          <div className="hero__grid page-container">
            <div className="hero__copy">
              <p className="hero__eyebrow">AI WALLPAPER · MADE PERSONAL</p>
              <h1>
                把想象留在屏幕上。
                <span>Make your screen feel like yours.</span>
              </h1>
              <p className="hero__summary">
                从一句描述开始，创作、调整并预览一张真正属于你的壁纸。
                <span>From first thought to the screen you see every day.</span>
              </p>
              <AndroidCta className="android-cta hero__cta" />
              <p className="hero__note">为 Android 而作 · Designed for Android</p>
            </div>

            <div className="hero__visual">
              <div aria-hidden="true" className="hero__orbit" />
              <DevicePreview
                className="hero__device"
                label="Lumina 极光壁纸在 Android 锁屏上的预览"
                variant="aurora"
              />
              <p aria-hidden="true" className="hero__visual-note">
                LUMINA / 01
                <span>LIGHT, HELD IN GLASS</span>
              </p>
            </div>
          </div>
        </section>

        <section className="page-section workflow" id="workflow">
          <div className="page-container">
            <SectionHeading
              eyebrow="HOW IT FLOWS / 创作流程"
              summary="三个清晰的步骤，让灵感从文字走进每天都会看见的屏幕。 Describe, refine, then make it yours."
              title="从灵感，到每天看见的世界。"
            />

            <div className="workflow-grid">
              {workflowSteps.map((step) => (
                <article className="workflow-card" key={step.number}>
                  <div className="workflow-card__copy">
                    <p className="workflow-card__number">{step.number}</p>
                    <h3>
                      {step.title}
                      <span>{step.englishTitle}</span>
                    </h3>
                    <p>{step.description}</p>
                  </div>
                  <DevicePreview
                    className="workflow-card__preview"
                    label={`${step.title}步骤的抽象壁纸预览`}
                    variant={step.variant}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section capabilities" id="features">
          <div className="page-container capabilities__layout">
            <SectionHeading
              eyebrow="WHAT YOU CAN DO / 功能"
              summary="围绕一张壁纸，保留从创作到应用真正需要的动作。 A focused toolkit for making, viewing, and keeping your work."
              title="创作的每一步，都为你的屏幕而存在。"
            />
            <div className="feature-grid">
              {capabilities.map((capability) => (
                <FeatureCard key={capability.eyebrow} {...capability} />
              ))}
            </div>
          </div>
        </section>

        <section className="closing page-section">
          <div className="closing__panel page-container">
            <p className="closing__eyebrow">YOUR SCREEN, YOUR WORLD</p>
            <h2>让每次解锁，都遇见你喜欢的世界。</h2>
            <p>Meet a world you love, every time you unlock.</p>
            <AndroidCta className="android-cta closing__cta" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container site-footer__inner">
          <p>Lumina — AI wallpaper, made personal.</p>
          <p>© {currentYear} Lumina</p>
        </div>
      </footer>
    </>
  );
}
