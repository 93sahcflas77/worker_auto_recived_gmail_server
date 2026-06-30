// const js = require("@eslint/js");
// const globals = require("globals");
const { defineConfig } = require('eslint/config');
// const prettier = require("eslint-plugin-prettier");

module.exports = defineConfig([
  //  GLOBAL IGNORE
  {
    ignores: ['node_mudules/**', 'dist/**', 'build/**', 'coverage/**', 'scripts/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    // LOCAL IGNORE
    ignores: ['commit-parser.js', 'commitlint.config.js', 'eslint.config.js'],
    rules: {
      // avoid bug
      'no-console': 0,
      'no-unused-vars': [0, { argsIgnorePattern: '^_' }], // use alwayes [const _req = ]
      'no-var': 2, //not use var
      'prefer-const': 2, //not use let
      'object-curly-spacing': [2, 'always'], //"no-undef": "error"
      'no-undef': 0, //spaces in objects
      'no-async-promise-executor': 2, //not prommise use
      'no-await-in-loop': 1, // Disallows using await inside loops.
      'no-debugger': 2, //"no-debugger": "error"
      'no-extra-boolean-cast': 2, // "no-extra-boolean-cast": "error"
      'no-dupe-args': 2, // Disallows duplicate parameter names in functions.
      'no-extra-semi': 2, // Disallows unnecessary semicolons.
      'no-template-curly-in-string': 0, // Disallows ${} inside normal strings (not template literals).
      'no-use-before-define': [2, { functions: false, classes: true, variables: true }], // Don’t use a variable or function before it is defined.
      'no-shadow': [0, { builtinGlobals: false }], // Don’t create a new variable with the same name as an outer variable (shadowing).
      'callback-return': 0, // If you call a callback, you must return immediately.
      'global-require': 0, // All require() calls must be at the top of the file, not inside functions or blocks.
      'no-mixed-requires': 2, //Don’t mix require() with other code in the same statement block.
      'handle-callback-err': [2, '^(err|error)$'], // You must handle the err argument in callbacks instead of ignoring it.

      eqeqeq: 2, // use always ===
      curly: 2, // Always use braces {} for if, for, while, etc. — even for one line
      'no-alert': 2, // alert(), comfirm() not use
      'no-caller': 2,
      'no-rval': 0, // no assigning return value
      'no-floating-decimal': 2, // use only 0.5 and 5.0
      'no-implied-eval': 2, // Don’t run code from strings using setTimeout or setInterval.
      'no-multi-spaces': 2, // Don’t use multiple spaces where one is enough.
      'no-new': 2, // Don’t call new without assigning the result.
      'no-return-assign': 2, //  Don’t assign and return in the same statement — it’s confusing.
      yoda: ['error', 'never'], // Don’t write conditions in “Yoda style”.

      'array-body-style': [0, 'as-needed'], // Prefer concise arrow returns
      'prefer-const': 2, // Use const when value doesn’t change
      'prefer-arrow-callback': 2, // Use arrow functions in callbacks
      'object-shorthand': [2, 'always'], // Use { name } instead of { name: name }
      'template-curly-spacing': [2, 'never'], //No spaces inside ${}

      semi: [2, 'always'], //use ; semicolon
      quotes: [2, 'single'], // ' ' single quotes
      indent: [2, 2], // Spaces used for indentation (tabs vs spaces, and how many spaces).
      'comma-dangle': [2, 'always-multiline'], // Whether you allow a comma at the last item in multi-line lists.
      'eol-last': [2, 'always'], // File must end with a newline.
      'key-spacing': [2, { beforeColon: false, afterColon: true }], // Spaces around : in object keys.
      'space-infix-ops': 2, // Spaces around operators like + - = * ===.
      'brace-style': [2, '1tbs'], // Where { appears.
      'keyword-spacing': [2, { before: true, after: true }], // Spaces after keywords like if, for, while, function.
      'max-len': [2, { code: 200 }], // Maximum line length.
      'object-curly-spacing': [2, 'always'], // Spaces inside {} in objects.
      'padded-blocks': [2, 'never'], // Blank lines at the start or end of blocks.
    },
  },
]);
