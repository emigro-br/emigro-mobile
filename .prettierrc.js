module.exports = {
  "singleQuote": true,
  "trailingComma": "all",
  "parser": "typescript",
  "plugins": [require.resolve("@trivago/prettier-plugin-sort-imports")],
  "importOrder": [
    "^react(.*)$",
    "^@react(.*)$", // React and React Native
    "<THIRD_PARTY_MODULES>", // Third-party modules
    "test-utils",
    "^@/(.*)$", // Internal imports
    "^[./]" // Parent imports
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true,
  "importOrderParserPlugins": ["typescript", "jsx"],
}
