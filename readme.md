# retext-readability [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Check readability with [**retext**][retext].  Applies
[Dale—Chall][dale-chall], [Automated Readability][automated-readability],
[Coleman-Liau][coleman-liau], [Flesch][flesch], [Gunning-Fog][gunning-fog],
[SMOG][smog], and [Spache][spache].

> Tip: I also made an online editable demo, similar to this project:
> [wooorm.com/readability](http://wooorm.com/readability/).

## Installation

[npm][]:

```bash
npm install retext-readability
```

## Usage

Say we have the following file, `example.txt`:

```text
The cat sat on the mat

The constellation also contains an isolated neutron
star—Calvera—and H1504+65, the hottest white dwarf yet
discovered, with a surface temperature of 200,000 kelvin
```

And our script, `example.js`, looks like this:

```javascript
var vfile = require('to-vfile');
var report = require('vfile-reporter');
var unified = require('unified');
var english = require('retext-english');
var stringify = require('retext-stringify');
var readability = require('retext-readability');

unified()
  .use(english)
  .use(readability)
  .use(stringify)
  .process(vfile.readSync('example.txt'), function (err, file) {
    console.error(report(err || file));
  });
```

Now, running `node example` yields:

```text
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

`number`, default: `16` — Target age group.  Note that the different
algorithms provide varying results, so your milage may vary with people
actually that age.  :wink:

###### `options.threshold`

`number`, default: `4 / 7` — By default, 4 out of the 7 algorithms need
to agree that a sentence is higher than the target age and whether it
should be warned about.  This can be modified by passing in a new threshold.

###### `options.minWords`

`number`, default: `5` — Minimum number of words a sentence should have when
warning.  Most algorithms are designed to take a large sample of sentences
to detect the body’s reading level.  This plug-in, however, works on a
per-sentence basis.  This makes the results quite skewered when said sentence
has, for example, a few long words or some unknown ones.

## Related

*   [`retext-syntax-mentions`](https://github.com/wooorm/retext-syntax-mentions)
    — Classify [**@mentions**](https://github.com/blog/821) as syntax
*   [`retext-simplify`](https://github.com/wooorm/retext-simplify)
    — Check phrases for simpler alternatives

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/retext-readability.svg

[travis]: https://travis-ci.org/wooorm/retext-readability

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/retext-readability.svg

[codecov]: https://codecov.io/github/wooorm/retext-readability

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[retext]: https://github.com/wooorm/retext

[dale-chall]: https://github.com/wooorm/dale-chall-formula

[automated-readability]: https://github.com/wooorm/automated-readability

[coleman-liau]: https://github.com/wooorm/coleman-liau

[flesch]: https://github.com/wooorm/flesch

[gunning-fog]: https://github.com/wooorm/gunning-fog

[spache]: https://github.com/wooorm/spache-formula

[smog]: https://github.com/wooorm/smog-formula
