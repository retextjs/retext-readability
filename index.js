'use strict';

var visit = require('unist-util-visit');
var toString = require('nlcst-to-string');
var syllable = require('syllable');
var daleChall = require('dale-chall');
var spache = require('spache');
var daleChallFormula = require('dale-chall-formula');
var ari = require('automated-readability');
var colemanLiau = require('coleman-liau');
var flesch = require('flesch');
var smog = require('smog-formula');
var gunningFog = require('gunning-fog');
var spacheFormula = require('spache-formula');

module.exports = readability;

var SOURCE = 'retext-readability';
var DEFAULT_TARGET_AGE = 16;
var WORDYNESS_THRESHOLD = 5;
var DEFAULT_THRESHOLD = 4 / 7;

var own = {}.hasOwnProperty;
var floor = Math.floor;
var round = Math.round;
var ceil = Math.ceil;
var sqrt = Math.sqrt;

function readability(options) {
  var settings = options || {};
  var targetAge = settings.age || DEFAULT_TARGET_AGE;
  var threshold = settings.threshold || DEFAULT_THRESHOLD;
  var minWords = settings.minWords;

  if (minWords === null || minWords === undefined) {
    minWords = WORDYNESS_THRESHOLD;
  }

  return transformer;

  function transformer(tree, file) {
    visit(tree, 'SentenceNode', gather);

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

      visit(sentence, 'WordNode', visitor);

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

      function visitor(node) {
        var value = toString(node);
        var syllables = syllable(value);

        wordCount++;
        totalSyllables += syllables;
        letters += value.length;
        caseless = value.toLowerCase();

        /* Count complex words for gunning-fog based on
         * whether they have three or more syllables
         * and whether they aren’t proper nouns.  The
         * last is checked a little simple, so this
         * index might be over-eager. */
        if (syllables >= 3) {
          polysillabicWord++;

          if (value.charCodeAt(0) === caseless.charCodeAt(0)) {
            complexPolysillabicWord++;
          }
        }

        /* Find unique unfamiliar words for spache. */
        if (spache.indexOf(caseless) !== -1 && !own.call(familiarWords, caseless)) {
          familiarWords[caseless] = true;
          familiarWordCount++;
        }

        /* Find unique difficult words for dale-chall. */
        if (daleChall.indexOf(caseless) !== -1 && !own.call(easyWord, caseless)) {
          easyWord[caseless] = true;
          easyWordCount++;
        }
      }
    }
  }
}

/* Calculate the typical starting age (on the higher-end) when
 * someone joins `grade` grade, in the US.
 * See https://en.wikipedia.org/wiki/Educational_stage#United_States. */
function gradeToAge(grade) {
  return round(grade + 5);
}

/* Calculate the age relating to a Flesch result. */
function fleschToAge(value) {
  return 20 - floor(value / 10);
}

/* Calculate the age relating to a SMOG result.
 * See http://www.readabilityformulas.com/smog-readability-formula.php. */
function smogToAge(value) {
  return ceil(sqrt(value) + 2.5);
}

/* eslint-disable max-params */

/* Report the `results` if they’re reliably too hard for
 * the `target` age. */
function report(file, node, threshold, target, results) {
  var length = results.length;
  var index = -1;
  var failCount = 0;
  var confidence;
  var message;

  while (++index < length) {
    if (results[index] > target) {
      failCount++;
    }
  }

  if (failCount / length >= threshold) {
    confidence = failCount + '/' + length;

    message = file.warn('Hard to read sentence (confidence: ' + confidence + ')', node, SOURCE);
    message.confidence = confidence;
    message.source = SOURCE;
    message.actual = toString(node);
    message.expected = null;
  }
}
