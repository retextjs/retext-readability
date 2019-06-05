# retext-readability

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**retext**][retext] plugin to check readability.
Applies [Dale—Chall][dale-chall],
[Automated Readability][automated-readability], [Coleman-Liau][], [Flesch][],
[Gunning-Fog][], [SMOG][], and [Spache][].

> Tip: I also made an online editable demo, similar to this project:
> [`wooorm.com/readability`](https://wooorm.com/readability/).

## Install

[npm][]:

```sh
npm install retext-readability
```

## Use

Say we have the following file, `example.txt`:

```txt
The cat sat on the mat

The constellation also contains an isolated neutron
star—Calvera—and H1504+65, the hottest white dwarf yet
discovered, with a surface temperature of 200,000 kelvin
```

…and our script, `example.js`, looks like this:

```js
var vfile = require('to-vfile')
var report = require('vfile-reporter')
var unified = require('unified')
var english = require('retext-english')
var stringify = require('retext-stringify')
var readability = require('retext-readability')

unified()
  .use(english)
  .use(readability)
  .use(stringify)
  .process(vfile.readSync('example.txt'), function(err, file) {
    console.error(report(err || file))
  })
```

Now, running `node example` yields:

```txt
example.txt
  3:1-5:57  warning  Hard to read sentence (confidence: 4/7)  retext-readability  retext-readability

⚠ 1 warning
```

By default, the target age is 16, but ages can be set, for example, to 6:

```diff
   .use(english)
-  .use(readability)
+  .use(readability, {age: 6})
   .use(stringify)
```

Now, running `node example` once more yields:

```txt
example.txt
  1:1-1:23  warning  Hard to read sentence (confidence: 4/7)  retext-readability  retext-readability
  3:1-5:57  warning  Hard to read sentence (confidence: 7/7)  retext-readability  retext-readability

⚠ 2 warnings
```

## API

### `retext().use(readability[, options])`

Detect possibly hard to read sentences.

###### `options.age`

Target age group (`number`, default: `16`).
Note that the different algorithms provide varying results, so your milage may
vary with people actually that age.  :wink:

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

## Related

*   [`retext-syntax-mentions`](https://github.com/retextjs/retext-syntax-mentions)
    — Classify [**@mentions**](https://github.com/blog/821) as syntax
*   [`retext-syntax-urls`](https://github.com/retextjs/retext-syntax-urls)
    — Classify URLs and filepaths as syntax
*   [`retext-simplify`](https://github.com/retextjs/retext-simplify)
    — Check phrases for simpler alternatives

## Contribute

See [`contributing.md`][contributing] in [`retextjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/retextjs/retext-readability.svg

[build]: https://travis-ci.org/retextjs/retext-readability

[coverage-badge]: https://img.shields.io/codecov/c/github/retextjs/retext-readability.svg

[coverage]: https://codecov.io/github/retextjs/retext-readability

[downloads-badge]: https://img.shields.io/npm/dm/retext-readability.svg

[downloads]: https://www.npmjs.com/package/retext-readability

[size-badge]: https://img.shields.io/bundlephobia/minzip/retext-readability.svg

[size]: https://bundlephobia.com/result?p=retext-readability

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/retext

[npm]: https://docs.npmjs.com/cli/install

[health]: https://github.com/retextjs/.github

[contributing]: https://github.com/retextjs/.github/blob/master/contributing.md

[support]: https://github.com/retextjs/.github/blob/master/support.md

[coc]: https://github.com/retextjs/.github/blob/master/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[retext]: https://github.com/retextjs/retext

[dale-chall]: https://github.com/words/dale-chall-formula

[automated-readability]: https://github.com/words/automated-readability

[coleman-liau]: https://github.com/words/coleman-liau

[flesch]: https://github.com/words/flesch

[gunning-fog]: https://github.com/words/gunning-fog

[spache]: https://github.com/words/spache-formula

[smog]: https://github.com/words/smog-formula
