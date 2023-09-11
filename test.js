import assert from 'node:assert/strict'
import test from 'node:test'
import {retext} from 'retext'
import retextReadability from 'retext-readability'

test('retext-readability', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('retext-readability')).sort(), [
      'default'
    ])
  })

  await t.test('should emit a message w/ metadata', async function () {
    const file = await retext()
      .use(retextReadability)
      .process(
        [
          'Oberon, also designated Uranus IV, is the outermost ',
          'major moon of the planet Uranus and quite large',
          'and massive for a Uranian moon.',
          ''
        ].join('\n')
      )

    assert.deepEqual(
      JSON.parse(JSON.stringify({...file.messages[0], ancestors: []})),
      {
        ancestors: [],
        column: 1,
        fatal: false,
        message:
          'Unexpected hard to read sentence, according to 4 out of 7 algorithms',
        line: 1,
        name: '1:1-3:32',
        place: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 3, column: 32, offset: 132}
        },
        reason:
          'Unexpected hard to read sentence, according to 4 out of 7 algorithms',
        ruleId: 'readability',
        source: 'retext-readability',
        actual:
          'Oberon, also designated Uranus IV, is the outermost \nmajor moon of the planet Uranus and quite large\nand massive for a Uranian moon.',
        expected: [],
        url: 'https://github.com/retextjs/retext-readability#readme'
      }
    )
  })

  await t.test(
    'should not warn when a sentence is easy to read',
    async function () {
      const file = await retext()
        .use(retextReadability)
        .process('The cat sat on the mat')

      assert.deepEqual(file.messages.map(String), [])
    }
  )

  await t.test(
    'should warn when low confidence that a sentence is hard to read',
    async function () {
      const file = await retext()
        .use(retextReadability)
        .process(
          [
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and quite large',
            'and massive for a Uranian moon.',
            ''
          ].join('\n')
        )

      assert.deepEqual(file.messages.map(String), [
        '1:1-3:32: Unexpected hard to read sentence, according to 4 out of 7 algorithms'
      ])
    }
  )

  await t.test('should support a threshold', async function () {
    const file = await retext()
      .use(retextReadability, {threshold: 5 / 7})
      .process(
        [
          'Oberon, also designated Uranus IV, is the outermost ',
          'major moon of the planet Uranus and quite large',
          'and massive for a Uranian moon.',
          ''
        ].join('\n')
      )

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test(
    'should support a given age (removing the warning)',
    async function () {
      const file = await retext()
        .use(retextReadability, {age: 18})
        .process(
          [
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and quite large',
            'and massive for a Uranian moon.',
            ''
          ].join('\n')
        )

      assert.deepEqual(file.messages.map(String), [])
    }
  )

  await t.test(
    'should support a given age (upping the warning)',
    async function () {
      const file = await retext()
        .use(retextReadability, {age: 14})
        .process(
          [
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and quite large',
            'and massive for a Uranian moon.',
            ''
          ].join('\n')
        )

      assert.deepEqual(file.messages.map(String), [
        '1:1-3:32: Unexpected hard to read sentence, according to 5 out of 7 algorithms'
      ])
    }
  )

  await t.test(
    'should warn when moderately confident that a sentence is hard to read',
    async function () {
      const file = await retext()
        .use(retextReadability)
        .process(
          [
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and the second-largest ',
            'and second most massive of the Uranian moons.',
            ''
          ].join('\n')
        )

      assert.deepEqual(file.messages.map(String), [
        '1:1-3:46: Unexpected hard to read sentence, according to 5 out of 7 algorithms'
      ])
    }
  )

  await t.test(
    'should warn when highly confident that a sentence is hard to read',
    async function () {
      const file = await retext()
        .use(retextReadability, {age: 6})
        .process(
          [
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and the second-largest ',
            'and second most massive of the Uranian moons, and the ',
            'ninth most massive moon in the Solar System.',
            ''
          ].join('\n')
        )

      assert.deepEqual(file.messages.map(String), [
        '1:1-4:45: Unexpected hard to read sentence, according to all 7 algorithms'
      ])
    }
  )

  await t.test('should support minWords (default)', async function () {
    const file = await retext()
      .use(retextReadability)
      .process('Honorificabilitudinitatibus.')

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test('should support `minWords` (config)', async function () {
    const file = await retext()
      .use(retextReadability, {minWords: 0})
      .process('Honorificabilitudinitatibus.')

    assert.deepEqual(file.messages.map(String), [
      '1:1-1:29: Unexpected hard to read sentence, according to 4 out of 7 algorithms'
    ])
  })
})
