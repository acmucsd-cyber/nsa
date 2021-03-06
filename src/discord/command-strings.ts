export default [
  {
    name: 'convert',
    fields: [
      {
        name: 'Usage:',
        value: '```-convert FROM TO YOUR_TEXT_HERE```\n',
      },
      {
        name: 'Description',
        value: 'Can be used to convert between any of the following:\n*a* -> Ascii\n*b* -> Binary\n*d* -> Decimal\n*h* -> Hex\n*6* -> Base64',
      },
      {
        name: 'Input Format:',
        value: 'ASCII: only utf-8 encoded charaters\nBinary: only 1, 0, and [space]\nDecimal: only 0-9 and [space]\nHex: only 0-9, a-f, and A-F allowed. 0x is allowed in front of string\nBase64: only a-z, A-Z, 0-9, +, /, and =',
      },
    ],
  },
  {
    name: 'toolkit',
    fields: [
      {
        name: 'Usage:',
        value: '```-toolkit CATEGORY ```or ```-tk CATEGORY```\n',
      },
      {
        name: 'Description',
        value: 'Recommends toolkits for various CTF categories including:\n*rev* -> Reverse Engineering\n*web*       -> Web\n*crypto* -> Cryptography\n*pentest* -> Pen Testing \n*steg* -> Steganography\n*forens* -> Forensics\n*osint* -> Open Source Intelligence\n*net* -> Network',
      },
    ],
  },
  {
    name: 'flag',
    fields: [
      {
        name: 'Usage:',
        value: '```-flag CHALLENGE_NAME FLAG```',
      },
      {
        name: 'Description:',
        value: '```Used to submit and check CTF flags\nNote: For flag security, you can only use this command in private messages to the bot.```',
      },
    ],
  },
  {
    name: 'roleremove',
    fields: [
      {
        name: 'Usage:',
        value: '```-roleremove ROLE```',
      },
      {
        name: 'Description',
        value: 'Removes a single role of your choice from you',
      },
    ],
  },
  {
    name: 'help',
    fields: [
      {
        name: 'User Commands:',
        value: '```\n-help\n-resources \n-FAQ\n-GettingStarted\n-toolkit or -tk\n-roleremove\n-name\n-flag```',
      },
      {
        name: 'Goon / Admin Commands:',
        value: '```\nNone\n```',
      },
    ],
  },
  {
    name: 'gettingstarted',
    fields: [
      {
        name: 'Get Started:',
        value: 'One of the best ways to get started is by learning the basics of CTFs. A great place to start would be picoCTF. Head to  [redacted for server safety] and look at the pinned messages to get started.',
      },
    ],
  },
  {
    name: 'faq',
    fields: [
      {
        name: 'What is the difference between ACM and ACM Cyber?',
        value: "ACM or the Association for Computing Machinery is a global community of students, developers, designers, and any industry professionals that uses computing in their daily lives. ACM-Cyber is a sub-community of UC San Diego's ACM chapter, functioning as an independent organization focused specifically on cyber-security while still engaging with the greater ACM community.",
      },
      {
        name: 'Can I still participate even if I don’t have any cybersecurity experience?',
        value: 'Yes! We welcome anyone and everyone of all skill levels, and we hope that by sticking around we can help you grow your own skill-set and interests.',
      },
      {
        name: 'I want to compete in CTFs -- how do I join a team?',
        value: "Use the roles channel to give yourself the @Hacker role and you'll get notifications for all upcoming events. For now, all are welcome to partake in any competition, regardless of skill level.",
      },
      {
        name: 'What if I have another question not listed here?',
        value: 'Feel free to ask anyone with a Goon or Admin rank at any time!',
      },
    ],
  },
  {
    name: 'name',
    fields: [
      {
        name: 'Usage:',
        value: '```-name [OPTIONS]...```',
      },
      {
        name: 'Description:',
        value: 'Generate a random username/handle for you in the format of _ADJECTIVE NOUN_. (Ex. silvery school)',
      },
      {
        name: 'Options:',
        value: `**--help**
See this help message
**--leet**
Default: false
Make your username l33t
**--separator** _SEPARATOR_
Default: [a single space character]
What to put between adjectives and nouns
Ex. \`-name --separator _\`
silvery_school
**--fraction-leet** _FRACTION_
Default: 0.7
A number between 0.0 and 1.0 (inclusive) that controls the probability that each convertible letter (a, e, i, o, s) will be converted into its corresponding digit.
A higher number results in names that tend to have more digits in it, but it may lead to less readable names.
This option has no effect when **--leet** is false`,
      },
    ],
  },
];
