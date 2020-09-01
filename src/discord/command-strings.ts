export default [
  {
    name: 'toolkit',
    fields: [
      {
        name: 'Usage:',
        value: '```-toolkit [category] ```or ```-tk [category]```\n',
      },
      {
        name: 'Description',
        value: 'Recommends toolkits for various CTF categories including:\n*rev* -> Reverse Engineering\n*web*       -> Web\n*crypto* -> Cryptography\n*pentest* -> Pen Testing \n*steg* -> Steganography\n*forens* -> Forensics\n*osint* -> Open Source Intelligence\n*net* -> Network',
      },
    ],
  },
  {
    name: 'roleremove',
    fields: [
      {
        name: 'Usage:',
        value: '```-roleremove [role]```',
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
        value: '```\n-help\n-resources \n-FAQ\n-GettingStarted\n-toolkit or -tk\n-roleremove\n```',
      },
      {
        name: 'Goon / Admin Commands:',
        value: '```\n-roles\n```',
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
];
