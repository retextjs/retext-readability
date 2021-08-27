/**
 * @typedef {import('nlcst').Root} Root
 *
 * @typedef Options
 * @property {number} [age=16]
 *   Target age group.
 *   Note that the different algorithms provide varying results, so your milage
 *   may vary with people actually that age.
 * @property {number} [threshold=4/7]
 *   Number of algorithms that need to agree.
 *   By default, 4 out of the 7 algorithms need to agree that a sentence is hard
 *   to read for the target age, in which case it’s warned about.
 * @property {number} [minWords=5]
 *   Minimum number of words a sentence should have when warning.
 *   Most algorithms are designed to take a large sample of sentences to detect
 *   the body’s reading level.
 *   This plugin works on a per-sentence basis and that makes the results quite
 *   skewered when a short sentence has a few long words or some unknown ones.
 */

import {automatedReadability} from 'automated-readability'
import {colemanLiau} from 'coleman-liau'
import {daleChall} from 'dale-chall'
import {daleChallFormula, daleChallGradeLevel} from 'dale-chall-formula'
import {flesch} from 'flesch'
import {gunningFog} from 'gunning-fog'
import {toString} from 'nlcst-to-string'
import {smogFormula} from 'smog-formula'
import {spache} from 'spache'
import {spacheFormula} from 'spache-formula'
import {syllable} from 'syllable'
import {visit, SKIP} from 'unist-util-visit'

const origin = 'retext-readability:readability'
const defaultTargetAge = 16
const defaultWordynessThreshold = 5
const defaultThreshold = 4 / 7

const own = {}.hasOwnProperty
const floor = Math.floor
const round = Math.round
const ceil = Math.ceil
const sqrt = Math.sqrt

/**
 * Plugin to detect possibly hard to read sentences.
 *
 * @type {import('unified').Plugin<[Options?], Root>}
 */
export default function retextReadability(options = {}) {
  const targetAge = options.age || defaultTargetAge
  const threshold = options.threshold || defaultThreshold
  const minWords =
    options.minWords === null || options.minWords === undefined
      ? defaultWordynessThreshold
      : options.minWords

  return (tree, file) => {
    visit(tree, 'SentenceNode', (sentence) => {
      /** @type {Record<string, boolean>} */
      const familiarWords = {}
      /** @type {Record<string, boolean>} */
      const easyWord = {}
      let complexPolysillabicWord = 0
      let familiarWordCount = 0
      let polysillabicWord = 0
      let totalSyllables = 0
      let easyWordCount = 0
      let wordCount = 0
      let letters = 0

      visit(sentence, 'WordNode', (node) => {
        const value = toString(node)
        const caseless = value.toLowerCase()
        const syllables = syllable(value)

        wordCount++
        totalSyllables += syllables
        letters += value.length

        // Count complex words for gunning-fog based on whether they have three
        // or more syllables and whether they aren’t proper nouns.  The last is
        // checked a little simple, so this index might be over-eager.
        if (syllables >= 3) {
          polysillabicWord++

          if (value.charCodeAt(0) === caseless.charCodeAt(0)) {
            complexPolysillabicWord++
          }
        }

        // Find unique unfamiliar words for spache.
        if (spache.includes(caseless) && !own.call(familiarWords, caseless)) {
          familiarWords[caseless] = true
          familiarWordCount++
        }

        // Find unique difficult words for dale-chall.
        if (daleChall.includes(caseless) && !own.call(easyWord, caseless)) {
          easyWord[caseless] = true
          easyWordCount++
        }
      })

      if (wordCount >= minWords) {
        const counts = {
          complexPolysillabicWord,
          polysillabicWord,
          unfamiliarWord: wordCount - familiarWordCount,
          difficultWord: wordCount - easyWordCount,
          syllable: totalSyllables,
          sentence: 1,
          word: wordCount,
          character: letters,
          letter: letters
        }

        /** @type {number[]} */
        const scores = [
          gradeToAge(daleChallGradeLevel(daleChallFormula(counts))[1]),
          gradeToAge(automatedReadability(counts)),
          gradeToAge(colemanLiau(counts)),
          fleschToAge(flesch(counts)),
          smogToAge(smogFormula(counts)),
          gradeToAge(gunningFog(counts)),
          gradeToAge(spacheFormula(counts))
        ]

        let index = -1
        let failCount = 0

        while (++index < scores.length) {
          if (scores[index] > targetAge) {
            failCount++
          }
        }

        const confidence = failCount / scores.length

        if (confidence >= threshold) {
          const label = failCount + '/' + scores.length

          Object.assign(
            file.message(
              'Hard to read sentence (confidence: ' + label + ')',
              sentence,
              origin
            ),
            {
              actual: toString(sentence),
              expected: [],
              confidence,
              confidenceLabel: label
            }
          )
        }
      }

      return SKIP
    })
  }
}

/**
 * Calculate the typical starting age (on the higher-end) when someone joins
 * `grade` grade, in the US.
 * See: <https://en.wikipedia.org/wiki/Educational_stage#United_States>
 *
 * @param {number} grade
 * @returns {number}
 */
function gradeToAge(grade) {
  return round(grade + 5)
}

/**
 * Calculate the age relating to a Flesch result.
 *
 * @param {number} value
 * @returns {number}
 */
function fleschToAge(value) {
  return 20 - floor(value / 10)
}

/**
 * Calculate the age relating to a SMOG result.
 * See: <http://www.readabilityformulas.com/smog-readability-formula.php>
 *
 * @param {number} value
 * @returns {number}
 */
function smogToAge(value) {
  return ceil(sqrt(value) + 2.5)
}
