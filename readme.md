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

You can opt-into this plugin when you’re dealing with content that might be
difficult to read to some folks, and have authors that can fix that content.

> 💡 **Tip**: I also made an online, editable, demo, similar to this project:
> [`wooorm.com/readability`](https://wooorm.com/readability/).

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install retext-readability
```

In Deno with [`esm.sh`][esmsh]:

```js
import retextReadability from 'https://esm.sh/retext-readability@7'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import retextReadability from 'https://esm.sh/retext-readability@7?bundle'
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

…and our module `example.js` looks as follows:

```js
import {read} from 'to-vfile'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import retextStringify from 'retext-stringify'
import retextReadability from 'retext-readability'

const file = unified()
  .use(retextEnglish)
  .use(retextReadability)
  .use(retextStringify)
  .process(await read('example.txt'))

console.error(reporter(file))
```

…now running `node example.js` yields:

```txt
example.txt
  3:1-5:57  warning  Hard to read sentence (confidence: 4/7)  retext-readability  retext-readability

⚠ 1 warning
```

The target age is `16` by default, which you can change.
For example, to `6`:

```diff
   .use(retextEnglish)
-  .use(retextReadability)
+  .use(retextReadability, {age: 6})
   .use(retextStringify)
```

…now running `node example.js` once moer yields:

```txt
example.txt
  1:1-1:23  warning  Hard to read sentence (confidence: 4/7)  retext-readability  retext-readability
  3:1-5:57  warning  Hard to read sentence (confidence: 7/7)  retext-readability  retext-readability

⚠ 2 warnings
```

## API

This package exports no identifiers.
The default export is `retextReadability`.

### `unified().use(retextReadability[, options])`

Detect possibly hard to read sentences.

##### `options`

Configuration (optional).

###### `options.age`

Target age group (`number`, default: `16`).
Note that the different algorithms provide varying results, so your milage may
vary with people actually that age.
:wink:

###### `options.threshold`

Number of algorithms that need to agree (`number`, default: `4 / 7`)
By default, 4 out of the 7 algorithms need to agree that a sentence is hard to
read for the target age, in which case it’s warned about.

###### `options.minWords`

Minimum number of words a sentence should have when warning (`number`, default:
`5`).
Most algorithms are designed to take a large sample of sentences to detect the
body’s reading level.
This plugin works on a per-sentence basis and that makes the results quite
skewered when a short sentence has a few long words or some unknown ones.

## Messages

Each message is emitted as a [`VFileMessage`][message] on `file`, with the
following fields:

###### `message.source`

Name of this plugin (`'retext-readability'`).

###### `message.ruleId`

Name of this rule (`'readability'`).

###### `message.actual`

Current not ok sentence (`string`).

###### `message.expected`

Empty array as there is no direct fix for `actual` (`[]`).

###### `message.confidence`

Number between `0` and `1` to represent how many algorithms agreed (`number`).

###### `message.confidenceLabel`

String representing the fraction of `confidence` (`string`, such as `4/7`).

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Options`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

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

[size-badge]: https://img.shields.io/bundlephobia/minzip/retext-readability.svg

[size]: https://bundlephobia.com/result?p=retext-readability

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

[unified]: https://github.com/unifiedjs/unified

[retext]: https://github.com/retextjs/retext

[message]: https://github.com/vfile/vfile-message

[dale-chall]: https://github.com/words/dale-chall-formula

[automated-readability]: https://github.com/words/automated-readability

[coleman-liau]: https://github.com/words/coleman-liau

[flesch]: https://github.com/words/flesch

[gunning-fog]: https://github.com/words/gunning-fog

[spache]: https://github.com/words/spache-formula

[smog]: https://github.com/words/smog-formula
