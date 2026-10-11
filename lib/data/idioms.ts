/**
 * Idiom seed entries.
 * - original_word / idiom_word: used by MCQ practice
 * - original / answer: full-sentence transform (existing content)
 * - example_sentence / example_answer: optional aliases for new content
 */
export type IdiomSeed = {
  original_word: string
  idiom_word: string
  original?: string
  answer?: string
  example_sentence?: string
  example_answer?: string
}

export const idioms: IdiomSeed[] = [
  {
    original: 'I telephoned the office yesterday to ask about my application status.',
    answer: 'I called up the office yesterday to ask about my application status.',
    original_word: 'telephoned',
    idiom_word: 'call up',
  },
  {
    original: 'The success of the project will depend on how well the team communicates.',
    answer: 'The success of the project will count on how well the team communicates.',
    original_word: 'depend on',
    idiom_word: 'count on',
  },
  {
    original: 'The meeting was cancelled because several participants were unable to attend.',
    answer: 'The meeting was called off because several participants were unable to attend.',
    original_word: 'cancelled',
    idiom_word: 'call off',
  },
  {
    original: 'The company adhered to the safety regulations during the construction process.',
    answer: 'The company stuck to the safety regulations during the construction process.',
    original_word: 'adhered',
    idiom_word: 'stick to',
  },
  {
    original: 'Visitors have the possibility of booking tickets online in advance.',
    answer: 'Visitors stand a chance of booking tickets online in advance.',
    original_word: 'have the possibility',
    idiom_word: 'stand a chance',
  },
  {
    original: 'The museum displayed several ancient artifacts during the exhibition.',
    answer: 'The museum showed off several ancient artifacts during the exhibition.',
    original_word: 'displayed',
    idiom_word: 'show off',
  },
  {
    original: 'She felt extremely tired after working late for several nights in a row.',
    answer: 'She felt tired out after working late for several nights in a row.',
    original_word: 'extremely tired',
    idiom_word: 'tired out',
  },
  {
    original: 'The committee is comprised of members from different department.',
    answer: 'The committee is made up of members from different department.',
    original_word: 'comprised',
    idiom_word: 'made up of',
  },
  {
    original: 'Your passport will remain valid for another three years.',
    answer: 'Your passport will hold good for another three years.',
    original_word: 'remain valid',
    idiom_word: 'hold good',
  },
  {
    original: 'The issue was discussed in detail during the staff meeting.',
    answer: 'The issue was talked over in detail during the staff meeting.',
    original_word: 'discussed',
    idiom_word: 'talk over',
  },
  {
    original: 'On weekends, she prefers to work leisurely without strict deadlines.',
    answer: 'On weekends, she prefers to take her time without strict deadlines.',
    original_word: 'work leisurely',
    idiom_word: "take one's time",
  },
  {
    original: 'It is impossible to complete the task without proper instructions.',
    answer: 'It is out of the question to complete the task without proper instructions.',
    original_word: 'impossible',
    idiom_word: 'out of the question',
  },
  {
    original: 'He finished his assignment before the deadline.',
    answer: 'He got through his assignment before the deadline.',
    original_word: 'finished',
    idiom_word: 'get through',
  },
  {
    original: 'They were surprised by the sudden change in plans.',
    answer: 'They were taken by surprise by the sudden change in plans.',
    original_word: 'surprised',
    idiom_word: 'take by surprise',
  },
  {
    original: 'The animals were reared on the farm under careful supervision.',
    answer: 'The animals were brought up on the farm under careful supervision.',
    original_word: 'reared',
    idiom_word: 'bring up',
  },
]