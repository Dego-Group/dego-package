export const SWCOptionsDev = {
  minify: false,
  sourceMaps: true,
  jsc: {
    parser: { syntax: 'typescript', tsx: false },
    minify: { compress: false, mangle: false },
  },
  env: { targets: { safari: '17.3' } },
}

export const SWCOptions = {
  sourceMaps: false,
  jsc: {
    parser: { syntax: 'typescript', tsx: false },
    minify: {
      compress: {
        arguments: true,
        booleans_as_integers: true,
        reduce_funcs: true,
      },
      mangle: true,
    },
  },
  env: { targets: { safari: '17.3' } },
}
