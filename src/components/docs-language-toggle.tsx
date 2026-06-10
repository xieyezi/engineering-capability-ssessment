export type DocsLanguage = 'zh' | 'en' | 'hk';

type DocsLanguageToggleProps = {
  language: DocsLanguage;
  onChange: (language: DocsLanguage) => void;
};

export function DocsLanguageToggle({
  language,
  onChange,
}: DocsLanguageToggleProps) {
  return (
    <div className="ml-auto inline-flex items-center rounded-lg border border-fd-border bg-fd-card p-1 text-sm">
      <button
        type="button"
        onClick={() => onChange('zh')}
        className={[
          'rounded-md px-3 py-1.5 transition-colors',
          language === 'zh'
            ? 'bg-fd-primary text-fd-primary-foreground'
            : 'text-fd-muted-foreground hover:text-fd-foreground',
        ].join(' ')}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => onChange('hk')}
        className={[
          'rounded-md px-3 py-1.5 transition-colors',
          language === 'hk'
            ? 'bg-fd-primary text-fd-primary-foreground'
            : 'text-fd-muted-foreground hover:text-fd-foreground',
        ].join(' ')}
      >
        粵語
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={[
          'rounded-md px-3 py-1.5 transition-colors',
          language === 'en'
            ? 'bg-fd-primary text-fd-primary-foreground'
            : 'text-fd-muted-foreground hover:text-fd-foreground',
        ].join(' ')}
      >
        EN
      </button>
    </div>
  );
}
