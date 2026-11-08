export const TRANSLATION = "WEB";
export const TRANSLATION_NAME = "World English Bible";

export type SeedTopic = {
  slug: string;
  name: string;
  description: string;
};

export type SeedPrayer = {
  title: string;
  author: string;
  body: string;
  scriptureReference: string;
  notes: string;
  topics: string[];
};

export type SeedVerse = {
  reference: string;
  text: string;
  translation: string;
  topics: string[];
};

export const seedTopics: SeedTopic[] = [
  {
    "slug": "prayer",
    "name": "Prayer",
    "description": "Asking God according to what he has already said."
  },
  {
    "slug": "love",
    "name": "Love",
    "description": "The love of God, and love for one another."
  },
  {
    "slug": "wisdom",
    "name": "Wisdom",
    "description": "Learning to walk in God’s wisdom, and asking him for it."
  },
  {
    "slug": "thanksgiving",
    "name": "Thanksgiving",
    "description": "Giving thanks to God in everything."
  }
];

export const seedPrayers: SeedPrayer[] = [
  {
    "title": "That you may know the hope of his calling",
    "author": "Paul",
    "scriptureReference": "Ephesians 1:15-23",
    "notes": "Paul gives thanks for their faith and love, and asks that they would know the hope, the inheritance, and the power that are already theirs in Christ.",
    "topics": [
      "prayer",
      "wisdom",
      "thanksgiving"
    ],
    "body": "For this cause I also, having heard of the faith in the Lord Jesus which is among you, and the love which you have toward all the saints, don’t cease to give thanks for you, making mention of you in my prayers, that the God of our Lord Jesus Christ, the Father of glory, may give to you a spirit of wisdom and revelation in the knowledge of him; having the eyes of your hearts enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints, and what is the exceeding greatness of his power toward us who believe, according to that working of the strength of his might which he worked in Christ, when he raised him from the dead, and made him to sit at his right hand in the heavenly places, far above all rule, and authority, and power, and dominion, and every name that is named, not only in this age, but also in that which is to come. He put all things in subjection under his feet, and gave him to be head over all things for the assembly, which is his body, the fullness of him who fills all in all."
  },
  {
    "title": "That Christ may dwell in your hearts",
    "author": "Paul",
    "scriptureReference": "Ephesians 3:14-21",
    "notes": "Paul kneels before the Father and asks that Christ would dwell in their hearts, and that they would know the love of Christ.",
    "topics": [
      "prayer",
      "love"
    ],
    "body": "For this cause, I bow my knees to the Father of our Lord Jesus Christ, from whom every family in heaven and on earth is named, that he would grant you, according to the riches of his glory, that you may be strengthened with power through his Spirit in the inward man; that Christ may dwell in your hearts through faith; to the end that you, being rooted and grounded in love, may be strengthened to comprehend with all the saints what is the width and length and height and depth, and to know Christ’s love which surpasses knowledge, that you may be filled with all the fullness of God. Now to him who is able to do exceedingly abundantly above all that we ask or think, according to the power that works in us, to him be the glory in the assembly and in Christ Jesus to all generations forever and ever. Amen."
  },
  {
    "title": "That your love may abound",
    "author": "Paul",
    "scriptureReference": "Philippians 1:9-11",
    "notes": "Paul prays that their love would keep growing in knowledge and discernment until the day of Christ.",
    "topics": [
      "prayer",
      "love",
      "wisdom"
    ],
    "body": "This I pray, that your love may abound yet more and more in knowledge and all discernment; so that you may approve the things that are excellent; that you may be sincere and without offense to the day of Christ; being filled with the fruits of righteousness, which are through Jesus Christ, to the glory and praise of God."
  },
  {
    "title": "Filled with the knowledge of his will",
    "author": "Paul",
    "scriptureReference": "Colossians 1:9-14",
    "notes": "Paul keeps asking that they would be filled with the knowledge of God’s will, and walk in a way that pleases the Lord.",
    "topics": [
      "prayer",
      "wisdom",
      "thanksgiving"
    ],
    "body": "For this cause, we also, since the day we heard this, don’t cease praying and making requests for you, that you may be filled with the knowledge of his will in all spiritual wisdom and understanding, that you may walk worthily of the Lord, to please him in all respects, bearing fruit in every good work, and increasing in the knowledge of God; strengthened with all power, according to the might of his glory, for all endurance and perseverance with joy; giving thanks to the Father, who made us fit to be partakers of the inheritance of the saints in light; who delivered us out of the power of darkness, and translated us into the Kingdom of the Son of his love; in whom we have our redemption, the forgiveness of our sins;"
  },
  {
    "title": "That our God may count you worthy",
    "author": "Paul",
    "scriptureReference": "2 Thessalonians 1:11-12",
    "notes": "Paul prays that God would count them worthy of their calling, and that the name of the Lord Jesus would be glorified in them.",
    "topics": [
      "prayer"
    ],
    "body": "To this end we also pray always for you, that our God may count you worthy of your calling, and fulfill every desire of goodness and work of faith, with power; that the name of our Lord Jesus may be glorified in you, and you in him, according to the grace of our God and the Lord Jesus Christ."
  },
  {
    "title": "That the Lord may make you increase in love",
    "author": "Paul",
    "scriptureReference": "1 Thessalonians 3:11-13",
    "notes": "Paul asks the Lord to grow their love and to establish their hearts in holiness.",
    "topics": [
      "prayer",
      "love"
    ],
    "body": "Now may our God and Father himself, and our Lord Jesus Christ, direct our way to you; and the Lord make you to increase and abound in love one toward another, and toward all men, even as we also do toward you, to the end he may establish your hearts blameless in holiness before our God and Father, at the coming of our Lord Jesus with all his saints."
  },
  {
    "title": "Comfort and good hope",
    "author": "Paul",
    "scriptureReference": "2 Thessalonians 2:16-17",
    "notes": "Paul asks the Lord Jesus and God the Father to comfort their hearts and establish them in every good work and word.",
    "topics": [
      "prayer"
    ],
    "body": "Now our Lord Jesus Christ himself, and God our Father, who loved us and gave us eternal comfort and good hope through grace, comfort your hearts and establish you in every good work and word."
  },
  {
    "title": "The God of hope",
    "author": "Paul",
    "scriptureReference": "Romans 15:13",
    "notes": "Paul asks the God of hope to fill them with joy and peace as they trust him.",
    "topics": [
      "prayer"
    ],
    "body": "Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope, in the power of the Holy Spirit."
  },
  {
    "title": "That the sharing of your faith may become effective",
    "author": "Paul",
    "scriptureReference": "Philemon 1:4-6",
    "notes": "Paul thanks God for Philemon’s love and faith, and prays that the sharing of that faith would become effective.",
    "topics": [
      "prayer",
      "love",
      "thanksgiving"
    ],
    "body": "I thank my God always, making mention of you in my prayers, hearing of your love, and of the faith which you have toward the Lord Jesus, and toward all the saints; that the fellowship of your faith may become effective, in the knowledge of every good thing which is in us in Christ Jesus."
  }
];

export const seedVerses: SeedVerse[] = [
  {
    "reference": "Philippians 4:6-7",
    "translation": "WEB",
    "topics": [
      "prayer",
      "thanksgiving"
    ],
    "text": "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus."
  },
  {
    "reference": "Matthew 6:9-13",
    "translation": "WEB",
    "topics": [
      "prayer"
    ],
    "text": "Pray like this: ‘Our Father in heaven, may your name be kept holy. Let your Kingdom come. Let your will be done, as in heaven, so on earth. Give us today our daily bread. Forgive us our debts, as we also forgive our debtors. Bring us not into temptation, but deliver us from the evil one. For yours is the Kingdom, the power, and the glory forever. Amen.’"
  },
  {
    "reference": "1 John 5:14-15",
    "translation": "WEB",
    "topics": [
      "prayer"
    ],
    "text": "This is the boldness which we have toward him, that, if we ask anything according to his will, he listens to us. And if we know that he listens to us, whatever we ask, we know that we have the petitions which we have asked of him."
  },
  {
    "reference": "Jeremiah 29:12-13",
    "translation": "WEB",
    "topics": [
      "prayer"
    ],
    "text": "You shall call on me, and you shall go and pray to me, and I will listen to you. You shall seek me, and find me, when you search for me with all your heart."
  },
  {
    "reference": "1 Thessalonians 5:16-18",
    "translation": "WEB",
    "topics": [
      "prayer",
      "thanksgiving"
    ],
    "text": "Rejoice always. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you."
  },
  {
    "reference": "1 Corinthians 13:4-7",
    "translation": "WEB",
    "topics": [
      "love"
    ],
    "text": "Love is patient and is kind; love doesn’t envy. Love doesn’t brag, is not proud, doesn’t behave itself inappropriately, doesn’t seek its own way, is not provoked, takes no account of evil; doesn’t rejoice in unrighteousness, but rejoices with the truth; bears all things, believes all things, hopes all things, endures all things."
  },
  {
    "reference": "John 13:34-35",
    "translation": "WEB",
    "topics": [
      "love"
    ],
    "text": "A new commandment I give to you, that you love one another. Just as I have loved you, you also love one another. By this everyone will know that you are my disciples, if you have love for one another.”"
  },
  {
    "reference": "1 John 4:7-8",
    "translation": "WEB",
    "topics": [
      "love"
    ],
    "text": "Beloved, let us love one another, for love is of God; and everyone who loves has been born of God, and knows God. He who doesn’t love doesn’t know God, for God is love."
  },
  {
    "reference": "Colossians 3:14",
    "translation": "WEB",
    "topics": [
      "love"
    ],
    "text": "Above all these things, walk in love, which is the bond of perfection."
  },
  {
    "reference": "James 1:5",
    "translation": "WEB",
    "topics": [
      "wisdom",
      "prayer"
    ],
    "text": "But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach; and it will be given to him."
  },
  {
    "reference": "Proverbs 3:5-6",
    "translation": "WEB",
    "topics": [
      "wisdom"
    ],
    "text": "Trust in Yahweh with all your heart, and don’t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight."
  },
  {
    "reference": "Proverbs 2:6",
    "translation": "WEB",
    "topics": [
      "wisdom"
    ],
    "text": "For Yahweh gives wisdom. Out of his mouth comes knowledge and understanding."
  },
  {
    "reference": "James 3:17",
    "translation": "WEB",
    "topics": [
      "wisdom"
    ],
    "text": "But the wisdom that is from above is first pure, then peaceful, gentle, reasonable, full of mercy and good fruits, without partiality, and without hypocrisy."
  },
  {
    "reference": "Psalm 100:4-5",
    "translation": "WEB",
    "topics": [
      "thanksgiving"
    ],
    "text": "Enter into his gates with thanksgiving, into his courts with praise. Give thanks to him, and bless his name. For Yahweh is good. His loving kindness endures forever, his faithfulness to all generations."
  },
  {
    "reference": "Psalm 107:1",
    "translation": "WEB",
    "topics": [
      "thanksgiving"
    ],
    "text": "Give thanks to Yahweh, for he is good, for his loving kindness endures forever."
  },
  {
    "reference": "Colossians 3:15-17",
    "translation": "WEB",
    "topics": [
      "thanksgiving"
    ],
    "text": "And let the peace of God rule in your hearts, to which also you were called in one body; and be thankful. Let the word of Christ dwell in you richly; in all wisdom teaching and admonishing one another with psalms, hymns, and spiritual songs, singing with grace in your heart to the Lord. Whatever you do, in word or in deed, do all in the name of the Lord Jesus, giving thanks to God the Father, through him."
  }
];
