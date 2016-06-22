# retext-readability [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

<!--lint disable heading-increment list-item-spacing-->

Check readability with [**retext**][retext].  Applies
[Dale—Chall][dale-chall], [Automated Readability][automated-readability],
[Coleman-Liau][coleman-liau], [Flesch][flesch], [Gunning-Fog][gunning-fog],
[SMOG][smog], and [Spache][spache].

## Installation

[npm][npm-install]:

```bash
npm install retext-readability
```

**retext-readability** is also available as an AMD, CommonJS, and
globals module, [uncompressed and compressed][releases].

## Usage

```js
var retext = require('retext');
var readability = require('retext-readability');
var report = require('vfile-reporter');

var doc = [
    'The cat sat on the mat',
    '',
    'The constellation also contains an isolated neutron ',
    'star—Calvera—and H1504+65, the hottest white dwarf yet ',
    'discovered, with a surface temperature of 200,000 kelvin',
    ''
].join('\n');
```

The defaults is to a target an age of 16:

```js
retext().use(readability).process(doc, function (err, file) {
    console.log(report(file));
});
```

Yields:

```txt
<stdin>
   3:1-5:57  warning  Very hard to read sentence

⚠ 1 warning
```

...but ages can be set, for example, to 8:

```js
retext().use(readability, {
    'age': 8
}).process(doc, function (err, file) {
    console.log(report(file));
});
```

Yields:

```txt
<stdin>
   1:1-1:23  warning  Quite hard to read sentence
   3:1-5:57  warning  Definitely hard to read sentence

⚠ 2 warnings
```

## API

### `retext().use(readability[, options])`

Detect possibly hard to read sentences.

###### `options`

*   `age` (`number`, default: `16`)
    — Target age group.  Note that the different algorithms
    provide varying results, so your milage might vary with
    people actually that age. :wink:
*   `threshold` (`number`, default: `4 / 7`)
    — By default, 4 out of the 7 algorithms need to agree that
    a sentence is higher that the target age and whether it should
    be warned about.  This can be modified by passing in a new
    threshold.
*   `minWords` (`number`, default: `5`)
    — Minimum number of words a sentence should have when warning.
    Most algorithms are designed to take a large sample of
    sentences to detect the body’s reading level.  This plug-in,
    however, works on a per-sentence basis.  This makes the results
    quite skewered when said sentence has, for example, a few long
    words or some unknown ones.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/retext-readability.svg

[travis]: https://travis-ci.org/wooorm/retext-readability

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/retext-readability.svg

[codecov]: https://codecov.io/github/wooorm/retext-readability

[npm-install]: https://docs.npmjs.com/cli/install

[releases]: https://github.com/wooorm/retext-readability/releases

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
