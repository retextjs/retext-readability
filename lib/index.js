/**
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {number | null | undefined} [age=16]
 *   Target age group (default: `16`).
 * @property {number | null | undefined} [minWords=5]
 *   Check sentences with at least this number of words (default: `5`);
 *   most algos are made to detect the reading level on an entire text;
 *   this plugin checks each sentence on its own;
 *   for short sentences, one long or complex word can strongly skew the
 *   results.
 * @property {number | null | undefined} [threshold=4 / 7]
 *   Number of algos (out of 7) that need to agree something is hard to read
 *   (default: `4 / 7`).
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
import {SKIP, visit} from 'unist-util-visit'

/** @type {Readonly<Options>} */
const emptyOptions = {}

/**
 * Check hard to read sentences.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function retextReadability(options) {
  const settings = options || emptyOptions
  const age = settings.age || 16
  const threshold = settings.threshold || 4 / 7
  const minWords = typeof settings.minWords === 'number' ? settings.minWords : 5

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree, file) {
    visit(tree, 'SentenceNode', function (sentence, _, parent) {
      /** @type {Set<string>} */
      const familiarWords = new Set()
      /** @type {Set<string>} */
      const easyWord = new Set()
      let complexPolysillabicWord = 0
      let easyWordCount = 0
      let familiarWordCount = 0
      let letters = 0
      let polysillabicWord = 0
      let totalSyllables = 0
      let wordCount = 0

      visit(sentence, 'WordNode', function (node) {
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
        if (spache.includes(caseless) && !familiarWords.has(caseless)) {
          familiarWords.add(caseless)
          familiarWordCount++
        }

        // Find unique difficult words for dale-chall.
        if (daleChall.includes(caseless) && !easyWord.has(caseless)) {
          easyWord.add(caseless)
          easyWordCount++
        }
      })

      if (wordCount >= minWords) {
        const counts = {
          character: letters,
          complexPolysillabicWord,
          difficultWord: wordCount - easyWordCount,
          letter: letters,
          polysillabicWord,
          sentence: 1,
          syllable: totalSyllables,
          unfamiliarWord: wordCount - familiarWordCount,
          word: wordCount
        }

        const scores = [
          gradeToAge(automatedReadability(counts)),
          gradeToAge(colemanLiau(counts)),
          gradeToAge(daleChallGradeLevel(daleChallFormula(counts))[1]),
          fleschToAge(flesch(counts)),
          gradeToAge(gunningFog(counts)),
          smogToAge(smogFormula(counts)),
          gradeToAge(spacheFormula(counts))
        ]

        let index = -1
        let nok = 0

        while (++index < scores.length) {
          if (scores[index] > age) {
            nok++
          }
        }

        const confidence = nok / scores.length

        if (confidence >= threshold) {
          const message = file.message(
            'Unexpected hard to read sentence, according to ' +
              (nok < scores.length ? nok + ' out of ' : 'all ') +
              scores.length +
              ' algorithms',
            {
              /* c8 ignore next -- verbose to test */
              ancestors: parent ? [parent, sentence] : [sentence],
              place: sentence.position,
              ruleId: 'readability',
              source: 'retext-readability'
            }
          )

          message.actual = toString(sentence)
          message.expected = []
          message.url = 'https://github.com/retextjs/retext-readability#readme'
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
 *   Grade.
 * @returns {number}
 *   Age.
 */
function gradeToAge(grade) {
  return Math.round(grade + 5)
}

/**
 * Calculate the age relating to a Flesch result.
 *
 * @param {number} value
 *   Flesch score.
 * @returns {number}
 *   Age.
 */
function fleschToAge(value) {
  return 20 - Math.floor(value / 10)
}

/**
 * Calculate the age relating to a SMOG result.
 * See: <http://www.readabilityformulas.com/smog-readability-formula.php>
 *
 * @param {number} value
 *   SMOG score.
 * @returns {number}
 *   Age.
 */
function smogToAge(value) {
  return Math.ceil(Math.sqrt(value) + 2.5)
}
