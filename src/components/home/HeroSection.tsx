import React from 'react';

export function HeroSection() {
  return (
    <section>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[var(--text)] mb-4 leading-tight">歡迎回到知識工作台</h1>
      <p className="text-[var(--text-muted)] text-lg lg:text-xl">今日目標：鞏固技術底層架構，為未來的規模化開發打好地基。</p>
    </section>
  );
}
