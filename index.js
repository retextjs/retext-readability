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

export default function retextReadability(options = {}) {
  const targetAge = options.age || defaultTargetAge
  const threshold = options.threshold || defaultThreshold
  let minWords = options.minWords

  if (minWords === null || minWords === undefined) {
    minWords = defaultWordynessThreshold
  }

  return (tree, file) => {
    visit(tree, 'SentenceNode', (sentence) => {
      const familiarWords = {}
      const easyWord = {}
      let complexPolysillabicWord = 0
      let familiarWordCount = 0
      let polysillabicWord = 0
      let totalSyllables = 0
      let easyWordCount = 0
      let wordCount = 0
      let letters = 0
      let counts
      let caseless

      visit(sentence, 'WordNode', (node) => {
        const value = toString(node)
        const syllables = syllable(value)

        wordCount++
        totalSyllables += syllables
        letters += value.length
        caseless = value.toLowerCase()

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
        counts = {
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

        report(file, sentence, threshold, targetAge, [
          gradeToAge(daleChallGradeLevel(daleChallFormula(counts))[1]),
          gradeToAge(automatedReadability(counts)),
          gradeToAge(colemanLiau(counts)),
          fleschToAge(flesch(counts)),
          smogToAge(smogFormula(counts)),
          gradeToAge(gunningFog(counts)),
          gradeToAge(spacheFormula(counts))
        ])
      }

      return SKIP
    })
  }
}

// Calculate the typical starting age (on the higher-end) when someone joins
// `grade` grade, in the US.  See:
// https://en.wikipedia.org/wiki/Educational_stage#United_States
function gradeToAge(grade) {
  return round(grade + 5)
}

// Calculate the age relating to a Flesch result.
function fleschToAge(value) {
  return 20 - floor(value / 10)
}

// Calculate the age relating to a SMOG result.  See:
// http://www.readabilityformulas.com/smog-readability-formula.php
function smogToAge(value) {
  return ceil(sqrt(value) + 2.5)
}

// Report the `results` if they’re reliably too hard for the `target` age.
// eslint-disable-next-line max-params
function report(file, node, threshold, target, results) {
  let index = -1
  let failCount = 0

  while (++index < results.length) {
    if (results[index] > target) {
      failCount++
    }
  }

  const confidence = failCount / results.length

  if (confidence >= threshold) {
    const label = failCount + '/' + results.length

    Object.assign(
      file.message(
        'Hard to read sentence (confidence: ' + label + ')',
        node,
        origin
      ),
      {actual: toString(node), expected: [], confidence, confidenceLabel: label}
    )
  }
}
