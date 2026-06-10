import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}

export function docsLayoutOptions(): BaseLayoutProps {
  return {
    ...baseOptions(),
    nav: {
      ...baseOptions().nav,
      title: ({ className }) => (
        <div
          className={[
            className,
            'flex flex-1 items-center',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <ThemeSwitch
            mode="light-dark"
            className="rounded-lg border-fd-border bg-fd-card *:rounded-md"
          />
        </div>
      ),
    },
    themeSwitch: {
      enabled: false,
    },
  };
}
