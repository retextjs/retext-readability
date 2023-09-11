# retext-readability

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[retext][]** plugin to check readability.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(retextReadability[, options])`](#unifieduseretextreadability-options)
    *   [`Options`](#options)
*   [Messages](#messages)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([retext][]) plugin to check readability: whether
your presumed target audience can read your prose.
It applies [Dale—Chall][dale-chall],
[Automated Readability][automated-readability], [Coleman-Liau][], [Flesch][],
[Gunning-Fog][], [SMOG][], and [Spache][].

## When should I use this?

You can use this plugin when you’re dealing with content that might be
difficult to read to some folks, and have authors that can fix that content.

> 💡 **Tip**: I also made an online, editable, demo, similar to this project:
> [`wooorm.com/readability`](https://wooorm.com/readability/).

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install retext-readability
```

In Deno with [`esm.sh`][esmsh]:

```js
import retextReadability from 'https://esm.sh/retext-readability@8'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import retextReadability from 'https://esm.sh/retext-readability@8?bundle'
</script>
```

## Use

Say our document `example.txt` contains:

```txt
The cat sat on the mat

The constellation also contains an isolated neutron
star—Calvera—and H1504+65, the hottest white dwarf yet
discovered, with a surface temperature of 200,000 kelvin
```

…and our module `example.js` contains:

```js
import retextEnglish from 'retext-english'
import retextReadability from 'retext-readability'
import retextStringify from 'retext-stringify'
import {read} from 'to-vfile'
import {unified} from 'unified'
import {reporter} from 'vfile-reporter'

const file = await unified()
  .use(retextEnglish)
  .use(retextReadability)
  .use(retextStringify)
  .process(await read('example.txt'))

console.error(reporter(file))
```

…then running `node example.js` yields:

```txt
example.txt
3:1-5:57 warning Unexpected hard to read sentence, according to 4 out of 7 algorithms readability retext-readability

⚠ 1 warning
```

The default target age is `16`.
You can pass something else, such as `6`:

```diff
   .use(retextEnglish)
-  .use(retextReadability)
+  .use(retextReadability, {age: 6})
   .use(retextStringify)
```

…then running `node example.js` again yields:

```txt
example.txt
1:1-1:23 warning Unexpected hard to read sentence, according to 4 out of 7 algorithms readability retext-readability
3:1-5:57 warning Unexpected hard to read sentence, according to all 7 algorithms      readability retext-readability

⚠ 2 warnings
```

## API

This package exports no identifiers.
The default export is [`retextReadability`][api-retext-readability].

### `unified().use(retextReadability[, options])`

Check hard to read sentences.

###### Parameters

*   `options` ([`Options`][api-options], optional)
    — configuration

###### Returns

Transform ([`Transformer`][unified-transformer]).

### `Options`

Configuration (TypeScript type).

###### Fields

*   `age` (`number`, default: `16`)
    — target age group
*   `minWords` (`number`, default: `5`)
    — check sentences with at least this number of words;
    most algos are made to detect the reading level on an entire text;
    this plugin checks each sentence on its own;
    for short sentences, one long or complex word can strongly skew the
    results
*   `threshold` (`number`, default: `4 / 7`)
    — number of algos (out of 7) that need to agree something is hard to read

## Messages

Each message is emitted as a [`VFileMessage`][vfile-message], with `source` set
to `'retext-readability'`, `ruleId` to `'readability'`, `actual` to the
difficult sentence, and `expected` to an empty array.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `retext-readability@^8`,
compatible with Node.js 16.

## Related

*   [`retext-syntax-mentions`](https://github.com/retextjs/retext-syntax-mentions)
    — classify [**@mentions**](https://github.com/blog/821) as syntax
*   [`retext-syntax-urls`](https://github.com/retextjs/retext-syntax-urls)
    — classify URLs and filepaths as syntax
*   [`retext-simplify`](https://github.com/retextjs/retext-simplify)
    — check phrases for simpler alternatives

## Contribute

See [`contributing.md`][contributing] in [`retextjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/retextjs/retext-readability/workflows/main/badge.svg

[build]: https://github.com/retextjs/retext-readability/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/retextjs/retext-readability.svg

[coverage]: https://codecov.io/github/retextjs/retext-readability

[downloads-badge]: https://img.shields.io/npm/dm/retext-readability.svg

[downloads]: https://www.npmjs.com/package/retext-readability

[size-badge]: https://img.shields.io/bundlejs/size/retext-readability

[size]: https://bundlejs.com/?q=retext-readability

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/retextjs/retext/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[health]: https://github.com/retextjs/.github

[contributing]: https://github.com/retextjs/.github/blob/main/contributing.md

[support]: https://github.com/retextjs/.github/blob/main/support.md

[coc]: https://github.com/retextjs/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[automated-readability]: https://github.com/words/automated-readability

[coleman-liau]: https://github.com/words/coleman-liau

[dale-chall]: https://github.com/words/dale-chall-formula

[flesch]: https://github.com/words/flesch

[gunning-fog]: https://github.com/words/gunning-fog

[retext]: https://github.com/retextjs/retext

[smog]: https://github.com/words/smog-formula

[spache]: https://github.com/words/spache-formula

[unified]: https://github.com/unifiedjs/unified

[unified-transformer]: https://github.com/unifiedjs/unified#transformer

[vfile-message]: https://github.com/vfile/vfile-message

[api-options]: #options

[api-retext-readability]: #unifieduseretextreadability-options
