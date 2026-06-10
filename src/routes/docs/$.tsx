import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { slugsToMarkdownPath, sortDocsPageTree, source } from '@/lib/source';
import browserCollections from 'collections/browser';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { docsLayoutOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Suspense, type ReactNode } from 'react';
import { useMDXComponents } from '@/components/mdx';
import { DocsLanguageToggle, type DocsLanguage } from '@/components/docs-language-toggle';

const INDEX_LANGUAGE_STORAGE_KEY = 'docs:index-language';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await loader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const loader = createServerFn({
  method: 'GET',
})
  .inputValidator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      slugs: page.slugs,
      markdownUrl: slugsToMarkdownPath(page.slugs).url,
      pageTree: await source.serializePageTree(sortDocsPageTree(source.getPageTree())),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    // you can define props for the component
    {
      markdownUrl,
      path,
      toolbar,
    }: {
      markdownUrl: string;
      path: string;
      toolbar?: ReactNode;
    },
  ) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
          {toolbar}
        </div>
        <DocsBody>
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const { pageTree, path, markdownUrl, slugs } = useFumadocsLoader(Route.useLoaderData());

  if (isLocalizedIndexSlugs(slugs)) {
    return (
      <DocsLayout {...docsLayoutOptions()} tree={pageTree}>
        <LocalizedIndexPage
          language={getLanguageFromSlugs(slugs)}
          markdownUrl={markdownUrl}
          path={path}
        />
      </DocsLayout>
    );
  }

  return (
    <DocsLayout {...docsLayoutOptions()} tree={pageTree}>
      <Link to={markdownUrl} hidden />
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  );
}

function LocalizedIndexPage({
  language,
  markdownUrl,
  path,
}: {
  language: DocsLanguage;
  markdownUrl: string;
  path: string;
}) {
  const navigate = useNavigate();

  return (
    <Suspense>
      {clientLoader.useContent(path, {
        markdownUrl,
        path,
        toolbar: (
          <DocsLanguageToggle
            language={language}
            onChange={(nextLanguage) => {
              window.localStorage.setItem(INDEX_LANGUAGE_STORAGE_KEY, nextLanguage);
              navigate({
                to: '/docs/$',
                params: {
                  _splat: getLocalizedIndexSplat(nextLanguage),
                },
              });
            }}
          />
        ),
      })}
    </Suspense>
  );
}

function isLocalizedIndexSlugs(slugs: string[]) {
  return (
    slugs.length === 0 ||
    (slugs.length === 1 && (slugs[0] === 'index.en' || slugs[0] === 'index.hk'))
  );
}

function getLanguageFromSlugs(slugs: string[]): DocsLanguage {
  if (slugs.length === 1 && slugs[0] === 'index.en') return 'en';
  if (slugs.length === 1 && slugs[0] === 'index.hk') return 'hk';
  return 'zh';
}

function getLocalizedIndexSplat(language: DocsLanguage) {
  if (language === 'en') return 'index.en';
  if (language === 'hk') return 'index.hk';
  return '';
}
