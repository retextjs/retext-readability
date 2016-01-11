/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module retext:readability
 * @fileoverview Test suite for `retext-readability`.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var test = require('tape');
var retext = require('retext');
var readability = require('./');

/*
 * Tests.
 */

test('readability', function (t) {
    retext()
        .use(readability)
        .process('The cat sat on the mat', function (err, file) {
            t.ifError(err, 'should not fail (#1)');

            t.deepEqual(
                file.messages.map(String),
                [],
                'should not warn when a sentence is easy to read'
            );
        });

    retext()
        .use(readability)
        .process([
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and quite large',
            'and massive for a Uranian moon.',
            ''
        ].join('\n'), function (err, file) {
            t.ifError(err, 'should not fail (#2)');

            t.deepEqual(
                file.messages.map(String),
                ['1:1-3:32: Quite hard to read sentence'],
                'should warn when a sentence is quite hard to read'
            );
        });

    retext()
        .use(readability, {
            'age': 18
        })
        .process([
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and quite large',
            'and massive for a Uranian moon.',
            ''
        ].join('\n'), function (err, file) {
            t.ifError(err, 'should not fail (#3)');

            t.deepEqual(
                file.messages.map(String),
                [],
                'should support a given age (removing the warning)'
            );
        });

    retext()
        .use(readability, {
            'age': 14
        })
        .process([
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and quite large',
            'and massive for a Uranian moon.',
            ''
        ].join('\n'), function (err, file) {
            t.ifError(err, 'should not fail (#4)');

            t.deepEqual(
                file.messages.map(String),
                ['1:1-3:32: Very hard to read sentence'],
                'should support a given age (upping the warning)'
            );
        });

    retext()
        .use(readability)
        .process([
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and the second-largest ',
            'and second most massive of the Uranian moons.',
            ''
        ].join('\n'), function (err, file) {
            t.ifError(err, 'should not fail (#5)');

            t.deepEqual(
                file.messages.map(String),
                ['1:1-3:46: Very hard to read sentence'],
                'should warn when a sentence is very hard to read'
            );
        });

    retext()
        .use(readability, {
            'age': 14
        })
        .process([
            'Oberon, also designated Uranus IV, is the outermost ',
            'major moon of the planet Uranus and the second-largest ',
            'and second most massive of the Uranian moons, and the ',
            'ninth most massive moon in the Solar System.',
            ''
        ].join('\n'), function (err, file) {
            t.ifError(err, 'should not fail (#6)');

            t.deepEqual(
                file.messages.map(String),
                ['1:1-4:45: Definitely hard to read sentence'],
                'should warn when a sentence is definitely hard to read'
            );
        });

    t.end();
});
