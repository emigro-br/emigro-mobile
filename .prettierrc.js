module.exports = {
  "singleQuote": true,
  "trailingComma": "all",
  "parser": "typescript",
  "plugins": [require.resolve("@trivago/prettier-plugin-sort-imports")],
  "importOrder": [
    "^react(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^@api/(.*)$",
    "^@assets/(.*)$",
    "^@components/(.*)$",
    "^@config/(.*)$",
    "^@constants/(.*)$",
    "^@dto/(.*)$",
    "^@hooks/(.*)$",
    "^@navigation/(.*)$",
    "^@screens/(.*)$",
    "^@services/(.*)$",
    "^@utils/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
