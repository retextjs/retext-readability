/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module retext:readability
 * @fileoverview Check readability with retext.
 */

'use strict';

/* eslint-env commonjs */

/* Dependencies. */
var daleChall = require('dale-chall/data/dale-chall.json');
var spache = require('spache/data/spache.json');
var visit = require('unist-util-visit');
var toString = require('nlcst-to-string');
var syllable = require('syllable');
var daleChallFormula = require('dale-chall-formula');
var ari = require('automated-readability');
var colemanLiau = require('coleman-liau');
var flesch = require('flesch');
var smog = require('smog-formula');
var gunningFog = require('gunning-fog');
var spacheFormula = require('spache-formula');

/* Constants. */
var DEFAULT_TARGET_AGE = 16;
var WORDYNESS_THRESHOLD = 5;
var SURENESS_THRESHOLD = 4 / 7;
var SURENESS_THRESHOLD_VERY = 5 / 7;
var SURENESS_THRESHOLD_DEFINITELY = 6 / 7;

/* Methods. */
var has = {}.hasOwnProperty;
var floor = Math.floor;
var round = Math.round;
var ceil = Math.ceil;
var sqrt = Math.sqrt;

/**
 * Calculate the typical starting age when someone joins
 * `grade` grade, in the US.
 *
 * @see https://en.wikipedia.org/wiki/Educational_stage#United_States
 *
 * @param {number} grade - US grade level.
 * @return {number} age - Typical age (on the higher-end)
 *   of students in `grade` grade.
 */
function gradeToAge(grade) {
    return round(grade + 5);
}

/**
 * Calculate the age relating to a Flesch result.
 *
 * @param {number} value - Flesch result.
 * @return {number} - Typical age for `value`.
 */
function fleschToAge(value) {
    return 20 - floor(value / 10);
}

/**
 * Calculate the age relating to a SMOG result.
 *
 * @see http://www.readabilityformulas.com/
 *   smog-readability-formula.php
 *
 * @param {number} value - SMOG result.
 * @return {number} - Typical age for `value`.
 */
function smogToAge(value) {
    return ceil(sqrt(value) + 2.5);
}

/**
 * Report the `results` if they’re reliably too hard for
 * the `target` age.
 *
 * @param {File} file - Virtual file.
 * @param {Node} node - NLCST node.
 * @param {number} threshold - Target threshold.
 * @param {number} target - Target age.
 * @param {Array.<number>} results - Reading-level in age
 *   for `node` according to several algorithms.
 */
function report(file, node, threshold, target, results) {
    var length = results.length;
    var result = 0;
    var index = -1;
    var level;
    var message;

    while (++index < length) {
        if (results[index] > target) {
            result++;
        }
    }

    result /= length;

    if (result >= threshold) {
        if (result >= SURENESS_THRESHOLD_DEFINITELY) {
            level = 'Definitely';
        } else if (result >= SURENESS_THRESHOLD_VERY) {
            level = 'Very';
        } else {
            level = 'Quite';
        }

        message = file.warn(level + ' hard to read sentence', node);

        message.level = level.toLowerCase();
        message.source = 'retext-readability';
    }
}

/**
 * Attacher.
 *
 * @param {Retext} processor - Processor.
 * @param {Object?} [options] - Configuration.
 * @return {Function} - `transformer`.
 */
function attacher(processor, options) {
    var settings = options || {};
    var targetAge = settings.age || DEFAULT_TARGET_AGE;
    var threshold = settings.threshold || SURENESS_THRESHOLD;
    var minWords = settings.minWords;

    if (minWords === null || minWords === undefined) {
        minWords = WORDYNESS_THRESHOLD;
    }

    return function (tree, file) {
        /**
         * Gather a sentence.
         *
         * @param {Node} sentence - Logical grouping.
         */
        function gather(sentence) {
            var familiarWords = {};
            var easyWord = {};
            var complexPolysillabicWord = 0;
            var familiarWordCount = 0;
            var polysillabicWord = 0;
            var totalSyllables = 0;
            var easyWordCount = 0;
            var wordCount = 0;
            var letters = 0;
            var counts;
            var caseless;

            visit(sentence, 'WordNode', function (node) {
                var syllables;
                var value;
                var head;

                wordCount++;
                value = toString(node);
                head = value.charAt(0);
                syllables = syllable(value);

                totalSyllables += syllables;
                letters += value.length;
                caseless = value.toLowerCase();

                /**
                 * Count complex words for gunning-fog based on
                 * whether they’re have three or more syllables
                 * and whether they are not proper nouns.  The
                 * last is checkt a little simple, so this
                 * index might be over-eager.
                 */

                if (syllables >= 3) {
                    polysillabicWord++;

                    if (head !== head.toUpperCase()) {
                        complexPolysillabicWord++;
                    }
                }

                /* Find unique unfamiliar words for spache. */
                if (
                    spache.indexOf(caseless) !== -1 &&
                    !has.call(familiarWords, caseless)
                ) {
                    familiarWords[caseless] = true;
                    familiarWordCount++;
                }

                /* Find unique difficult words for dale-chall. */
                if (
                    daleChall.indexOf(caseless) !== -1 &&
                    !has.call(easyWord, caseless)
                ) {
                    easyWord[caseless] = true;
                    easyWordCount++;
                }
            });

            if (wordCount < minWords) {
                return;
            }

            counts = {
                complexPolysillabicWord: complexPolysillabicWord,
                polysillabicWord: polysillabicWord,
                unfamiliarWord: wordCount - familiarWordCount,
                difficultWord: wordCount - easyWordCount,
                syllable: totalSyllables,
                sentence: 1,
                word: wordCount,
                character: letters,
                letter: letters
            };

            report(file, sentence, threshold, targetAge, [
                gradeToAge(daleChallFormula.gradeLevel(
                    daleChallFormula(counts)
                )[1]),
                gradeToAge(ari(counts)),
                gradeToAge(colemanLiau(counts)),
                fleschToAge(flesch(counts)),
                smogToAge(smog(counts)),
                gradeToAge(gunningFog(counts)),
                gradeToAge(spacheFormula(counts))
            ]);
        }

        visit(tree, 'SentenceNode', gather);
    };
}

/* Expose. */
module.exports = attacher;
