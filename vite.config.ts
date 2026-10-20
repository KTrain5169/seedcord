import { defineConfig } from 'vite-plus';

import { runEslint } from './scripts/src/lint-staged.ts';

export default defineConfig({
  lint: {
    "plugins": [
      "oxc",
      "typescript",
      "unicorn"
    ],
    "categories": {
      "correctness": "warn"
    },
    "options": {
      "typeAware": true,
      "typeCheck": true
    },
    "env": {
      "builtin": true
    },
    "ignorePatterns": [
      "dist/**",
      "node_modules/**",
      "logs/**",
      "tests/temp/**",
      "**/next-env.d.ts",
      ".next/**",
      "out/**",
      "build/**"
    ],
    "rules": {
      "vite-plus/prefer-vite-plus-imports": "error",
      "oxc/bad-bitwise-operator": "warn",
      "typescript/no-deprecated": "warn",
    },
    "overrides": [
      {
        "files": [
          "**/*.js",
          "**/*.mjs"
        ],
        "env": {
          "es2026": true
        }
      },
      {
        "files": [
          "**/*.ts",
          "**/*.tsx"
        ],
        "env": {
          "es2026": true
        },
        "rules": {
          "constructor-super": "off",
          "getter-return": "off",
          "no-class-assign": "off",
          "no-const-assign": "off",
          "no-dupe-class-members": "off",
          "no-dupe-keys": "off",
          "no-func-assign": "off",
          "no-import-assign": "off",
          "no-new-native-nonconstructor": "off",
          "no-obj-calls": "off",
          "no-redeclare": "off",
          "no-setter-return": "off",
          "no-this-before-super": "off",
          "no-undef": "off",
          "no-unreachable": "off",
          "no-unsafe-negation": "off",
          "no-var": "error",
          "no-with": "off",
          "prefer-const": "error",
          "prefer-rest-params": "error",
          "prefer-spread": "error",
          "no-array-constructor": "error",
          "no-unused-expressions": "error",
          "no-unused-vars": [
            "error",
            {
              "argsIgnorePattern": "^_",
              "varsIgnorePattern": "^_",
              "destructuredArrayIgnorePattern": "^_"
            }
          ],
          "typescript/ban-ts-comment": [
            "error",
            {
              "minimumDescriptionLength": 10
            }
          ],
          "typescript/no-duplicate-enum-values": "error",
          "typescript/no-empty-object-type": "off",
          "typescript/no-explicit-any": [
            "error",
            {
              "ignoreRestArgs": true,
              "fixToUnknown": true
            }
          ],
          "typescript/no-extra-non-null-assertion": "error",
          "typescript/no-misused-new": "error",
          "typescript/no-namespace": "error",
          "typescript/no-non-null-asserted-optional-chain": "error",
          "typescript/no-require-imports": "error",
          "typescript/no-this-alias": "error",
          "typescript/no-unnecessary-type-constraint": "error",
          "typescript/no-unsafe-declaration-merging": "error",
          "typescript/no-unsafe-function-type": "error",
          "typescript/no-wrapper-object-types": "error",
          "typescript/prefer-as-const": "error",
          "typescript/prefer-namespace-keyword": "error",
          "typescript/triple-slash-reference": "error",
          "no-implied-eval": "off",
          "no-throw-literal": "off",
          "prefer-promise-reject-errors": "off",
          "require-await": "off",
          "typescript/await-thenable": "error",
          "typescript/no-array-delete": "error",
          "typescript/no-base-to-string": "error",
          "typescript/no-duplicate-type-constituents": "error",
          "typescript/no-floating-promises": "error",
          "typescript/no-for-in-array": "error",
          "typescript/no-implied-eval": "error",
          "typescript/no-misused-promises": "error",
          "typescript/no-redundant-type-constituents": "error",
          "typescript/no-unnecessary-type-assertion": "error",
          "typescript/no-unsafe-argument": "error",
          "typescript/no-unsafe-assignment": "error",
          "typescript/no-unsafe-call": "error",
          "typescript/no-unsafe-enum-comparison": "error",
          "typescript/no-unsafe-member-access": "error",
          "typescript/no-unsafe-return": "error",
          "typescript/no-unsafe-unary-minus": "error",
          "typescript/only-throw-error": "error",
          "typescript/prefer-promise-reject-errors": "error",
          "typescript/require-await": "error",
          "typescript/restrict-plus-operands": "error",
          "typescript/restrict-template-expressions": [
            "error",
            {
              "allow": [
                {
                  "name": [
                    "Error",
                    "URL",
                    "URLSearchParams"
                  ],
                  "from": "lib"
                },
                {
                  "name": "ResolvedEmoji",
                  "from": "package",
                  "package": "@seedcord/http"
                },
                {
                  "name": [
                    "GuildEmoji",
                    "ApplicationEmoji"
                  ],
                  "from": "package",
                  "package": "discord.js"
                }
              ],
              "allowAny": true,
              "allowBoolean": true,
              "allowNullish": true,
              "allowNumber": true,
              "allowRegExp": true
            }
          ],
          "typescript/unbound-method": "error",
          "no-useless-constructor": "off",
          "typescript/no-dynamic-delete": "error",
          "typescript/no-extraneous-class": "error",
          "typescript/no-invalid-void-type": "error",
          "typescript/no-non-null-asserted-nullish-coalescing": "error",
          "typescript/no-non-null-assertion": "warn",
          "typescript/prefer-literal-enum-member": "error",
          "typescript/unified-signatures": "warn",
          "no-empty-function": "off",
          "typescript/adjacent-overload-signatures": "error",
          "typescript/array-type": "error",
          "typescript/ban-tslint-comment": "error",
          "typescript/class-literal-property-style": "error",
          "typescript/consistent-generic-constructors": "error",
          "typescript/consistent-indexed-object-style": "error",
          "typescript/consistent-type-assertions": "error",
          "typescript/consistent-type-definitions": "error",
          "typescript/no-confusing-non-null-assertion": "error",
          "typescript/no-inferrable-types": "error",
          "typescript/prefer-for-of": "error",
          "typescript/prefer-function-type": "error",
          "typescript/explicit-function-return-type": [
            "warn",
            {
              "allowExpressions": true,
              "allowTypedFunctionExpressions": true,
              "allowHigherOrderFunctions": true,
              "allowDirectConstAssertionInArrowFunctions": true
            }
          ],
          "typescript/explicit-module-boundary-types": "warn",
          "typescript/no-deprecated": "warn",
          "typescript/prefer-nullish-coalescing": "error",
          "typescript/prefer-optional-chain": "error",
          "typescript/no-unnecessary-condition": "warn",
          "typescript/prefer-readonly": "error",
          "typescript/prefer-readonly-parameter-types": "off",
          "typescript/strict-boolean-expressions": [
            "off",
            {
              "allowString": true,
              "allowNumber": false,
              "allowNullableObject": true,
              "allowNullableBoolean": true,
              "allowNullableString": true,
              "allowNullableNumber": false,
              "allowAny": false
            }
          ],
          "typescript/consistent-type-imports": [
            "error",
            {
              "prefer": "type-imports",
              "disallowTypeAnnotations": false,
              "fixStyle": "separate-type-imports"
            }
          ],
          "typescript/consistent-type-exports": [
            "error",
            {
              "fixMixedExportsWithInlineTypeSpecifier": true
            }
          ],
          "typescript/no-import-type-side-effects": "error"
        }
      },
      {
        "files": [
          "**/*.js",
          "**/*.mjs",
          "**/*.ts",
          "**/*.tsx"
        ],
        "rules": {
          "security/detect-buffer-noassert": "warn",
          "security/detect-child-process": "warn",
          "security/detect-disable-mustache-escape": "warn",
          "security/detect-eval-with-expression": "warn",
          "security/detect-new-buffer": "warn",
          "security/detect-no-csrf-before-method-override": "warn",
          "security/detect-non-literal-fs-filename": "warn",
          "security/detect-non-literal-regexp": "warn",
          "security/detect-non-literal-require": "warn",
          "security/detect-object-injection": "warn",
          "security/detect-possible-timing-attacks": "warn",
          "security/detect-pseudoRandomBytes": "warn",
          "security/detect-unsafe-regex": "warn",
          "security/detect-bidi-characters": "warn",
          "security/detect-invisible-characters": "warn",
          "import/newline-after-import": [
            "error",
            {
              "count": 1
            }
          ],
          "import/no-duplicates": [
            "error",
            {
              "considerQueryString": true
            }
          ],
          "import/no-cycle": "warn",
          "import/first": "error",
          "import/no-absolute-path": "error",
          "import/no-self-import": "error"
        },
        "jsPlugins": [
          "eslint-plugin-security"
        ],
        "plugins": [
          "import"
        ]
      },
      {
        "files": [
          "**/*.ts",
          "**/*.tsx"
        ],
        "rules": {
          "tsdoc/syntax": "warn"
        },
        "jsPlugins": [
          "eslint-plugin-tsdoc"
        ]
      },
      {
        "files": [
          "**/*.js",
          "**/*.mjs",
          "**/*.ts",
          "**/*.tsx"
        ],
        "rules": {
          "unicorn/error-message": "error",
          "unicorn/new-for-builtins": "error",
          "unicorn/throw-new-error": "error",
          "unicorn/prefer-type-error": "error",
          "unicorn/no-instanceof-builtins": "error",
          "unicorn/no-invalid-fetch-options": "error",
          "unicorn/no-await-in-promise-methods": "error",
          "unicorn/no-single-promise-in-promise-methods": "error",
          "unicorn/no-unnecessary-await": "error",
          "unicorn/no-array-method-this-argument": "error",
          "unicorn/no-thenable": "error",
          "unicorn/no-useless-promise-resolve-reject": "error",
          "unicorn/no-new-buffer": "error",
          "unicorn/require-array-join-separator": "error",
          "unicorn/require-number-to-fixed-digits-argument": "error",
          "unicorn/prefer-node-protocol": "error",
          "unicorn/prefer-string-slice": "error",
          "unicorn/prefer-string-starts-ends-with": "error",
          "unicorn/prefer-string-trim-start-end": "error",
          "unicorn/prefer-string-replace-all": "error",
          "unicorn/prefer-string-raw": "error",
          "unicorn/prefer-negative-index": "error",
          "unicorn/prefer-array-some": "error",
          "unicorn/prefer-array-find": "error",
          "unicorn/prefer-array-index-of": "error",
          "unicorn/prefer-array-flat": "error",
          "unicorn/prefer-array-flat-map": "error",
          "unicorn/prefer-includes": "error",
          "unicorn/prefer-set-has": "error",
          "unicorn/prefer-set-size": "error",
          "unicorn/prefer-date-now": "error",
          "unicorn/prefer-regexp-test": "error",
          "unicorn/prefer-number-properties": "error",
          "unicorn/prefer-optional-catch-binding": "error",
          "unicorn/prefer-spread": "error",
          "unicorn/prefer-at": "error",
          "unicorn/prefer-global-this": "error",
          "unicorn/prefer-native-coercion-functions": "error",
          "unicorn/prefer-export-from": "error",
          "unicorn/prefer-modern-math-apis": "error",
          "unicorn/prefer-math-trunc": "error",
          "unicorn/prefer-math-min-max": "error",
          "unicorn/prefer-object-from-entries": "error",
          "unicorn/prefer-structured-clone": "error",
          "unicorn/numeric-separators-style": "error",
          "unicorn/number-literal-case": "error",
          "unicorn/no-zero-fractions": "error",
          "unicorn/escape-case": "error",
          "unicorn/switch-case-braces": "error",
          "unicorn/switch-case-break-position": "error",
          "unicorn/no-typeof-undefined": "error",
          "unicorn/explicit-length-check": "error",
          "unicorn/consistent-existence-index-check": "error",
          "unicorn/no-nested-ternary": "error",
          "unicorn/no-lonely-if": "error",
          "unicorn/no-useless-spread": "error",
          "unicorn/no-useless-fallback-in-spread": "error",
          "unicorn/no-useless-length-check": "error",
          "unicorn/no-await-expression-member": "error",
          "unicorn/no-unreadable-array-destructuring": "error",
          "unicorn/no-static-only-class": "error",
          "unicorn/text-encoding-identifier-case": "error"
        }
      },
      {
        "files": [
          "**/*.js",
          "**/*.mjs",
          "**/*.ts",
          "**/*.tsx"
        ],
        "rules": {
          "no-console": "warn",
          "no-debugger": "error",
          "no-alert": "error",
          "no-eval": "error",
          "no-implied-eval": "error",
          "no-new-func": "error",
          "no-script-url": "error",
          "no-return-assign": "error",
          "no-sequences": "error",
          "no-throw-literal": "error",
          "no-unmodified-loop-condition": "error",
          "no-unused-expressions": "error",
          "no-useless-call": "error",
          "no-useless-concat": "error",
          "no-useless-return": "error",
          "prefer-promise-reject-errors": "error",
          "require-await": "off",
          "yoda": "error",
          "complexity": [
            "warn",
            15
          ],
          "max-depth": [
            "warn",
            5
          ],
          "max-nested-callbacks": [
            "warn",
            3
          ],
          "max-params": [
            "warn",
            5
          ],
          "max-statements": [
            "warn",
            25
          ],
          "max-lines": [
            "warn",
            400
          ],
          "max-lines-per-function": [
            "warn",
            {
              "max": 80,
              "skipComments": true,
              "skipBlankLines": true
            }
          ],
          "eqeqeq": [
            "error",
            "always"
          ],
          "curly": [
            "error",
            "all"
          ],
          "default-case": "error",
          "default-case-last": "error",
          "guard-for-in": "error",
          "no-caller": "error",
          "no-constructor-return": "error",
          "no-else-return": "error",
          "no-empty-function": "off",
          "no-eq-null": "error",
          "no-lone-blocks": "error",
          "no-loop-func": "error",
          "no-magic-numbers": [
            "warn",
            {
              "ignore": [
                -1,
                0,
                1,
                2,
                5,
                10,
                20,
                100,
                1000,
                1024,
                5000,
                10000
              ],
              "ignoreArrayIndexes": true,
              "ignoreDefaultValues": true,
              "ignoreClassFieldInitialValues": true,
              "enforceConst": false,
              "detectObjects": false
            }
          ],
          "new-cap": [
            "error",
            {
              "newIsCap": true,
              "capIsNew": false,
              "properties": true
            }
          ],
          "no-new": "warn",
          "no-new-wrappers": "error",
          "no-param-reassign": "off",
          "no-proto": "error",
          "no-self-compare": "error",
          "no-useless-escape": "error",
          "no-with": "error",
          "prefer-const": "error",
          "prefer-template": "warn",
          "radix": "error",
          "func-style": [
            "error",
            "declaration",
            {
              "allowArrowFunctions": true
            }
          ],
          "arrow-body-style": [
            "error",
            "as-needed",
            {
              "requireReturnForObjectLiteral": false
            }
          ],
          "security/detect-object-injection": "off",
          "security/detect-non-literal-fs-filename": "off",
          "security/detect-non-literal-regexp": "off",
          "no-useless-constructor": "off",
          "no-restricted-imports": [
            "error",
            {
              "patterns": [
                {
                  "regex": "^\\.\\./",
                  "message": "Import a file outside this folder through a path alias, like `#src/...`."
                }
              ]
            }
          ],
          "typescript/dot-notation": "error"
        },
        "jsPlugins": [
          "eslint-plugin-security"
        ]
      },
      {
        "files": [
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/*.types-test.ts"
        ],
        "rules": {
          "max-lines-per-function": "off",
          "no-magic-numbers": "off",
          "no-unused-expressions": "off",
          "max-lines": [
            "error",
            {
              "max": 500,
              "skipBlankLines": true,
              "skipComments": true
            }
          ],
          "max-nested-callbacks": [
            "warn",
            5
          ],
          "typescript/no-non-null-assertion": "off"
        }
      }
    ],
    "jsPlugins": [
      {
        "name": "vite-plus",
        "specifier": "vite-plus/oxlint-plugin"
      }
    ]
  },
  staged: {
      // this will become 'vp check --fix --no-error-on-unmatched-pattern'
      // once eslint has been replaced with oxlint
      '*': 'vp fmt --no-error-on-unmatched-pattern',
      '*.{ts,tsx,js,jsx,cjs,mjs}': runEslint
  },
  fmt: {
      // importing the defaults with createOxfmtConfig() ignores that
      // templates are apart of ignorePatterns and formats them anyway
      ignorePatterns: [
          'node_modules/**',
          '.eslintcache',
          '.eslintrc.js',
          '.env',
          'turbo/generators/templates/**',
          'cli/create-seedcord/templates/**',
          '**/.next/**',
          '**/dist/**',
          '**/.turbo/**',
          '**/coverage/**',
          'pnpm-lock.yaml',
          '**/seedcord-gen.d.ts',
          '**/.seedcord/**',
          '**/.cloudflare/**',
          '**/.wrangler/**',
          '**/worker-configuration.d.ts'
      ],
      tabWidth: 4,
      sortImports: true,
      semi: true,
      singleQuote: true,
      trailingComma: 'none',
      printWidth: 120,
      bracketSpacing: true,
      arrowParens: 'always',
      endOfLine: 'lf',
      useTabs: false,
      quoteProps: 'as-needed',
      bracketSameLine: false,
      proseWrap: 'never',
      overrides: [
          {
              files: ['*.yml', '*.yaml'],
              options: { tabWidth: 2 }
          },
          {
              // files: ['tooling/ui/**/*.{ts,tsx,json,md,css}'],
              files: [
                  'tooling/ui/**/*.ts',
                  'tooling/ui/**/*.tsx',
                  'tooling/ui/**/*.json',
                  'tooling/ui/**/*.md',
                  'tooling/ui/**/*.css'
              ],
              options: {
                  sortTailwindcss: {
                      stylesheet: './tooling/ui/src/styles/globals.css',
                      functions: ['cn', 'tw']
                  }
              }
          },
          {
              // files: ['apps/docs/**/*.{ts,tsx,json,md,css}'],
              files: [
                  'apps/docs/**/*.ts',
                  'apps/docs/**/*.tsx',
                  'apps/docs/**/*.json',
                  'apps/docs/**/*.md',
                  'apps/docs/**/*.css'
              ],
              options: {
                  sortTailwindcss: {
                      stylesheet: './apps/docs/src/app/globals.css',
                      functions: ['cn', 'tw']
                  }
              }
          },
          {
              // files: ['apps/home/**/*.{ts,tsx,json,md,css}'],
              files: [
                  'apps/home/**/*.ts',
                  'apps/home/**/*.tsx',
                  'apps/home/**/*.json',
                  'apps/home/**/*.md',
                  'apps/home/**/*.css'
              ],
              options: {
                  sortTailwindcss: {
                      stylesheet: './apps/home/src/app/globals.css',
                      functions: ['cn', 'tw']
                  }
              }
          },
          {
              // files: ['apps/guide/**/*.{ts,tsx,json,md,css}'],
              files: [
                  'apps/guide/**/*.ts',
                  'apps/guide/**/*.tsx',
                  'apps/guide/**/*.json',
                  'apps/guide/**/*.md',
                  'apps/guide/**/*.css'
              ],
              options: {
                  sortTailwindcss: {
                      stylesheet: './apps/guide/src/app/globals.css',
                      functions: ['cn', 'tw']
                  }
              }
          },
          {
              // 68 characters is what the 680px code column fits at the 1280px shell
              files: ['apps/guide/content/**/*.mdx'],
              options: { printWidth: 68 }
          }
      ]
  }
});
