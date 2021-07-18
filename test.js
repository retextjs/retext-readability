import test from 'tape'
import {retext} from 'retext'
import retextReadability from './index.js'

test('retext-readability', function (t) {
  retext()
    .use(retextReadability)
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function (error, file) {
        t.deepEqual(
          [error].concat(JSON.parse(JSON.stringify(file.messages))),
          [
            null,
            {
              name: '1:1-3:32',
              message: 'Hard to read sentence (confidence: 4/7)',
              reason: 'Hard to read sentence (confidence: 4/7)',
              line: 1,
              column: 1,
              source: 'retext-readability',
              ruleId: 'readability',
              position: {
                start: {line: 1, column: 1, offset: 0},
                end: {line: 3, column: 32, offset: 132}
              },
              fatal: false,
              actual:
                'Oberon, also designated Uranus IV, is the outermost \nmajor moon of the planet Uranus and quite large\nand massive for a Uranian moon.',
              expected: [],
              confidence: 4 / 7,
              confidenceLabel: '4/7'
            }
          ],
          'should emit messages'
        )
      }
    )

  retext()
    .use(retextReadability)
    .process('The cat sat on the mat', function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
        [null],
        'should not warn when a sentence is easy to read'
      )
    })

  retext()
    .use(retextReadability)
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function (error, file) {
        t.deepEqual(
          [error].concat(file.messages.map(String)),
          [null, '1:1-3:32: Hard to read sentence (confidence: 4/7)'],
          'should warn when low confidence that a sentence is hard to read'
        )
      }
    )

  retext()
    .use(retextReadability, {threshold: 5 / 7})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function (error, file) {
        t.deepEqual(
          [error].concat(file.messages.map(String)),
          [null],
          'should support a threshold'
        )
      }
    )

  retext()
    .use(retextReadability, {age: 18})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function (error, file) {
        t.deepEqual(
          [error].concat(file.messages.map(String)),
          [null],
          'should support a given age (removing the warning)'
        )
      }
    )

  retext()
    .use(retextReadability, {age: 14})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function (error, file) {
        t.deepEqual(
          [error].concat(file.messages.map(String)),
          [null, '1:1-3:32: Hard to read sentence (confidence: 5/7)'],
          'should support a given age (upping the warning)'
        )
      }
    )

  retext()
    .use(retextReadability)
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and the second-largest ',
        'and second most massive of the Uranian moons.',
        ''
      ].join('\n'),
      function (error, file) {
        t.deepEqual(
          [error].concat(file.messages.map(String)),
          [null, '1:1-3:46: Hard to read sentence (confidence: 5/7)'],
          'should warn when moderately confident that a sentence is hard to read'
        )
      }
    )

  retext()
    .use(retextReadability, {age: 14})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and the second-largest ',
        'and second most massive of the Uranian moons, and the ',
        'ninth most massive moon in the Solar System.',
        ''
      ].join('\n'),
      function (error, file) {
        t.deepEqual(
          [error].concat(file.messages.map(String)),
          [null, '1:1-4:45: Hard to read sentence (confidence: 6/7)'],
          'should warn when highly confident that a sentence is hard to read'
        )
      }
    )

  retext()
    .use(retextReadability)
    .process('Honorificabilitudinitatibus.', function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
        [null],
        'should support minWords (default)'
      )
    })

  retext()
    .use(retextReadability, {minWords: 0})
    .process('Honorificabilitudinitatibus.', function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
        [null, '1:1-1:29: Hard to read sentence (confidence: 4/7)'],
        'should support `minWords` (config)'
      )
    })

  t.end()
})
