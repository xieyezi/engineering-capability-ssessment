import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docs } from 'collections/server';
import { docsRoute } from './shared';

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  plugins: [lucideIconsPlugin()],
});

export function markdownPathToSlugs(segs: string[]) {
  if (segs.length === 0) return [];

  const out = [...segs];
  out[out.length - 1] = out[out.length - 1].replace(/\.md$/, '');
  if (out.length === 1 && out[0] === 'index') out.pop();
  return out;
}

export function slugsToMarkdownPath(slugs: string[]) {
  const segments = [...slugs];
  if (segments.length === 0) {
    segments.push('index.md');
  } else {
    segments[segments.length - 1] += '.md';
  }

  return {
    segments,
    url: `${docsRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(slugs: string[]) {
  const segments = [...slugs];
  if (segments.length === 0) {
    segments.push('index.md');
  } else {
    segments[segments.length - 1] += '.md';
  }

  return {
    segments,
    url: `${docsRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}

type PageTreeNode = ReturnType<typeof source.getPageTree>;
type PageTreeChild = PageTreeNode['children'][number];

const localizedIndexOrder = new Map<string, number>([
  ['/docs', 0],
  ['/docs/index.hk', 1],
  ['/docs/index.en', 2],
]);

export function sortDocsPageTree(tree: PageTreeNode): PageTreeNode {
  return {
    ...tree,
    children: [...tree.children].sort(comparePageTreeChildren),
  };
}

function comparePageTreeChildren(a: PageTreeChild, b: PageTreeChild) {
  const aOrder = getLocalizedIndexOrder(a);
  const bOrder = getLocalizedIndexOrder(b);

  if (aOrder !== bOrder) return aOrder - bOrder;

  const aKey = 'url' in a ? a.url : a.name?.toString() ?? '';
  const bKey = 'url' in b ? b.url : b.name?.toString() ?? '';

  return aKey.localeCompare(bKey);
}

function getLocalizedIndexOrder(node: PageTreeChild) {
  if ('url' in node) return localizedIndexOrder.get(node.url) ?? Number.POSITIVE_INFINITY;
  if ('index' in node && node.index?.url) {
    return localizedIndexOrder.get(node.index.url) ?? Number.POSITIVE_INFINITY;
  }

  return Number.POSITIVE_INFINITY;
}
