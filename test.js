'use strict'

var test = require('tape')
var retext = require('retext')
var readability = require('.')

test('readability', function(t) {
  retext()
    .use(readability)
    .process('The cat sat on the mat', function(err, file) {
      t.deepEqual(
        [err].concat(file.messages.map(String)),
        [null],
        'should not warn when a sentence is easy to read'
      )
    })

  retext()
    .use(readability)
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function(err, file) {
        t.deepEqual(
          [err].concat(file.messages.map(String)),
          [null, '1:1-3:32: Hard to read sentence (confidence: 4/7)'],
          'should warn when low confidence that a sentence is hard to read'
        )
      }
    )

  retext()
    .use(readability, {threshold: 5 / 7})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function(err, file) {
        t.deepEqual(
          [err].concat(file.messages.map(String)),
          [null],
          'should support a threshold'
        )
      }
    )

  retext()
    .use(readability, {age: 18})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function(err, file) {
        t.deepEqual(
          [err].concat(file.messages.map(String)),
          [null],
          'should support a given age (removing the warning)'
        )
      }
    )

  retext()
    .use(readability, {age: 14})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and quite large',
        'and massive for a Uranian moon.',
        ''
      ].join('\n'),
      function(err, file) {
        t.deepEqual(
          [err].concat(file.messages.map(String)),
          [null, '1:1-3:32: Hard to read sentence (confidence: 5/7)'],
          'should support a given age (upping the warning)'
        )
      }
    )

  retext()
    .use(readability)
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and the second-largest ',
        'and second most massive of the Uranian moons.',
        ''
      ].join('\n'),
      function(err, file) {
        t.deepEqual(
          [err].concat(file.messages.map(String)),
          [null, '1:1-3:46: Hard to read sentence (confidence: 5/7)'],
          'should warn when moderately confident that a sentence is hard to read'
        )
      }
    )

  retext()
    .use(readability, {age: 14})
    .process(
      [
        'Oberon, also designated Uranus IV, is the outermost ',
        'major moon of the planet Uranus and the second-largest ',
        'and second most massive of the Uranian moons, and the ',
        'ninth most massive moon in the Solar System.',
        ''
      ].join('\n'),
      function(err, file) {
        t.deepEqual(
          [err].concat(file.messages.map(String)),
          [null, '1:1-4:45: Hard to read sentence (confidence: 6/7)'],
          'should warn when highly confident that a sentence is hard to read'
        )
      }
    )

  retext()
    .use(readability)
    .process('Honorificabilitudinitatibus.', function(err, file) {
      t.deepEqual(
        [err].concat(file.messages.map(String)),
        [null],
        'should support minWords (default)'
      )
    })

  retext()
    .use(readability, {minWords: 0})
    .process('Honorificabilitudinitatibus.', function(err, file) {
      t.deepEqual(
        [err].concat(file.messages.map(String)),
        [null, '1:1-1:29: Hard to read sentence (confidence: 4/7)'],
        'should support `minWords` (config)'
      )
    })

  t.end()
})
