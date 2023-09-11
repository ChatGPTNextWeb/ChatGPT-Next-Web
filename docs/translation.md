# How to add a new translation?

Assume that we are adding a new translation for `new`.

1. copy `app/locales/en.ts` to `app/locales/new.ts`;
2. edit `new.ts`, change `const en: LocaleType = ` to `const new: PartialLocaleType`, and `export default new;`;
3. edit `app/locales/index.ts`:
4. `import new from './new.ts'`;
5. add `new` to `ALL_LANGS`;
6. add `new: "new lang"` to `ALL_LANG_OPTIONS`;
7. translate the strings in `new.ts`;
8. submit a pull request, and the author will merge it.
