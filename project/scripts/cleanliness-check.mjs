import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagesDir = path.join(root, 'resources', 'js', 'Pages');
const packageJsonPath = path.join(root, 'package.json');
const legacyAdminShellDir = path.join(root, 'resources', 'js', 'admin-shell');
const allowedPageRoots = new Set(['Admin', 'Auth', 'Landing', 'Tenant']);
const bannedFiles = [
  path.join(root, 'resources', 'js', 'Layouts', 'HorizontalLayout'),
  path.join(root, 'resources', 'js', 'Layouts', 'Header.tsx'),
  path.join(root, 'resources', 'js', 'Layouts', 'Footer.tsx'),
  path.join(root, 'resources', 'js', 'Layouts', 'Sidebar.tsx'),
  path.join(root, 'resources', 'js', 'Layouts', 'index.tsx'),
  path.join(root, 'resources', 'js', 'Layouts', 'TwoColumnLayout'),
  path.join(root, 'resources', 'js', 'Layouts', 'VerticalLayouts'),
  path.join(root, 'resources', 'js', 'Layouts', 'LayoutMenuData.tsx'),
  path.join(root, 'resources', 'js', 'Pages', 'Profile'),
  path.join(root, 'resources', 'js', 'Pages', 'Landing', 'Job_Landing'),
  path.join(root, 'resources', 'js', 'Pages', 'Landing', 'NFTLanding'),
  path.join(root, 'resources', 'js', 'common', 'data'),
  path.join(root, 'resources', 'scss', 'admin-shell.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_blog.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_coming-soon.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_ecommerce.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_email.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_file-manager.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_galaxy.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_gallery.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_invoice.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_job-landing.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_jobs.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_kanban.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_nft-landing.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_search-results.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_sitemap.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_timeline.scss'),
  path.join(root, 'resources', 'scss', 'pages', '_to-do.scss'),
  path.join(root, 'resources', 'images', 'blog'),
  path.join(root, 'resources', 'images', 'brands'),
  path.join(root, 'resources', 'images', 'clients'),
  path.join(root, 'resources', 'images', 'companies'),
  path.join(root, 'resources', 'images', 'galaxy'),
  path.join(root, 'resources', 'images', 'layouts'),
  path.join(root, 'resources', 'images', 'modals'),
  path.join(root, 'resources', 'images', 'nft'),
  path.join(root, 'resources', 'images', 'products'),
  path.join(root, 'resources', 'images', 'small'),
  path.join(root, 'resources', 'images', 'sweetalert2'),
  path.join(root, 'resources', 'images', 'svg', 'crypto-icons'),
];
const bannedImports = [
  'admin-shell/',
  'Layouts/HorizontalLayout',
  'Layouts/TwoColumnLayout',
  'Layouts/VerticalLayouts',
  'Layouts/LayoutMenuData',
  'slices/layouts',
  'common/data',
  'Components/Common/RightSidebar',
];
const bannedPackages = [
  '@reduxjs/toolkit',
  'react-redux',
  'redux',
  'react-scrollspy',
];

function fail(message) {
  console.error(`Cleanliness check failed: ${message}`);
  process.exitCode = 1;
}

const pageRoots = fs.readdirSync(pagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const invalidPageRoots = pageRoots.filter((entry) => !allowedPageRoots.has(entry));
if (invalidPageRoots.length > 0) {
  fail(`unexpected page roots detected: ${invalidPageRoots.join(', ')}`);
}

for (const bannedFile of bannedFiles) {
  if (fs.existsSync(bannedFile)) {
    fail(`non-core residue still exists: ${path.relative(root, bannedFile)}`);
  }
}

if (fs.existsSync(legacyAdminShellDir)) {
  const legacyAdminShellEntries = fs.readdirSync(legacyAdminShellDir);
  if (legacyAdminShellEntries.length > 0) {
    fail(`non-core residue still exists: ${path.relative(root, legacyAdminShellDir)}`);
  }
}

function walk(dir, fileList = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
      continue;
    }

    if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

const sourceFiles = walk(path.join(root, 'resources', 'js')).filter((file) => !file.includes(`${path.sep}compat${path.sep}`));
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const bannedImport of bannedImports) {
    if (content.includes(bannedImport)) {
      fail(`banned import "${bannedImport}" found in ${path.relative(root, file)}`);
    }
  }

  const compatImportMatches = content.match(/from ['"][^'"]*compat\/velzon\/[^'"]+['"]/g) ?? [];
  for (const match of compatImportMatches) {
    if (!match.includes("compat/velzon/index") && !match.includes("compat/velzon'") && !match.includes('compat/velzon"')) {
      fail(`core source must import compat adapters only from compat/velzon root: ${path.relative(root, file)}`);
    }
  }
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const declaredPackages = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

for (const bannedPackage of bannedPackages) {
  if (declaredPackages[bannedPackage]) {
    fail(`legacy package "${bannedPackage}" should not be declared in package.json`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
