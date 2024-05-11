export const degoPackageRootPath = process.argv[1]
  .split('\\')
  .slice(0, -4)
  .join('\\')
