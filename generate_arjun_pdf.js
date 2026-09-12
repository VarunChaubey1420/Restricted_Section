import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

async function generatePDF() {
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const goldColor = rgb(0.72, 0.53, 0.15); // #b8860b
    const darkBrown = rgb(0.18, 0.12, 0.08); // #2e1e14
    const bodyColor = rgb(0.12, 0.09, 0.06);
    const warmBg = rgb(0.98, 0.96, 0.92);

    const PAGE_WIDTH = 420;
    const PAGE_HEIGHT = 595; // A5-proportions matching the book

    // Helper: Add Decorative Page Border
    function drawPageBorder(page) {
        const { width, height } = page.getSize();
        // Background
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: warmBg
        });

        // Outer Border
        page.drawRectangle({
            x: 20,
            y: 20,
            width: width - 40,
            height: height - 40,
            borderColor: goldColor,
            borderWidth: 1.5,
            color: undefined
        });

        // Inner Border
        page.drawRectangle({
            x: 24,
            y: 24,
            width: width - 48,
            height: height - 48,
            borderColor: rgb(0.85, 0.75, 0.55),
            borderWidth: 0.5,
            color: undefined
        });

        // Corner accents
        const corners = [
            [23, 23],
            [width - 23, 23],
            [23, height - 23],
            [width - 23, height - 23]
        ];
        for (const [cx, cy] of corners) {
            page.drawCircle({
                x: cx,
                y: cy,
                size: 3,
                color: goldColor
            });
        }
    }

    // Helper: Wrap text into lines
    function wrapText(text, maxWidth, font, fontSize) {
        const lines = [];
        const rawLines = text.split("\n");
        for (const rawLine of rawLines) {
            const words = rawLine.split(" ");
            let currentLine = "";
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);
                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
        }
        return lines;
    }

    // 1. FRONT COVER (Page 1)
    const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const coverPath = path.resolve("./images/arjun1.png");
    if (fs.existsSync(coverPath)) {
        const coverBytes = fs.readFileSync(coverPath);
        const coverImg = await pdfDoc.embedPng(coverBytes);
        coverPage.drawImage(coverImg, {
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT
        });
    } else {
        drawPageBorder(coverPage);
        coverPage.drawText("ARJUN'S ODYSSEY", {
            x: 70,
            y: PAGE_HEIGHT - 120,
            size: 28,
            font: timesBold,
            color: darkBrown
        });
        coverPage.drawText("MYSTERIES OF NAVRANG VAN", {
            x: 95,
            y: PAGE_HEIGHT - 155,
            size: 14,
            font: timesRoman,
            color: goldColor
        });
        coverPage.drawText("Written by", {
            x: 180,
            y: 90,
            size: 11,
            font: timesItalic,
            color: darkBrown
        });
        coverPage.drawText("VARUN CHAUBEY", {
            x: 145,
            y: 65,
            size: 15,
            font: timesBold,
            color: darkBrown
        });
    }

    // 2. OPENER (Page 2)
    const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageBorder(page2);
    const openerText = "An Epic Adventure Begins From Here....";
    const opWidth = timesBold.widthOfTextAtSize(openerText, 17);
    page2.drawText(openerText, {
        x: (PAGE_WIDTH - opWidth) / 2,
        y: PAGE_HEIGHT / 2 + 10,
        size: 17,
        font: timesBold,
        color: darkBrown
    });
    page2.drawText("~ ~ ~", {
        x: PAGE_WIDTH / 2 - 15,
        y: PAGE_HEIGHT / 2 - 25,
        size: 12,
        font: timesRoman,
        color: goldColor
    });

    // 3. COMPLETE STORY PAGES 1 TO 68 (Pages 3 to 70 of PDF)
    const pagesData = [
        {
            pageNum: 1,
            type: "story",
            paragraphs: [
                "Hello, dear readers! My name is Arjun Singh, and this is the story of my first real adventure. I am a student of the famous BrahmaGyan Institute of Magic, located on the beautiful island of Amrita Dweep. At our school, we study normal subjects, but we also learn the art of making magical potions, which makes our lives very different from ordinary students.",
                "But this story is not about exams or classrooms. It is about a journey that changed me forever—an adventure full of mystery, danger, and surprises that began during my holidays. What started as a normal day soon turned into something far greater than I had ever imagined."
            ]
        },
        {
            pageNum: 2,
            type: "story",
            paragraphs: [
                "Before I take you deep into this magical world, let me first tell you a little about myself, so you understand who I am and why this journey means so much to me.",
                "Holidays were usually slow for me. Most days, I stayed at home, finished my homework, and spent time watching movies. That afternoon felt no different. The house was quiet, and the sunlight coming through the window made everything feel lazy and calm.",
                "I sat on the sofa with a bowl of snacks, scrolling through movie channels, finally stopping at a horror film. \"Perfect... this should kill some time,\" I thought to myself."
            ]
        },
        {
            pageNum: 3,
            type: "character",
            name: "Arjun",
            bio: "My name is Arjun Singh. I am 19 years old. I study at BrahmaGyan Institute of potin making and live at house no. 14 in Swastika Street. I love to solve puzzles and watch horror movies. I never went on adventure but my dream is to become a adventurer just like my elder brother Vikram."
        },
        {
            pageNum: 4,
            type: "story",
            paragraphs: [
                "The movie slowly built tension, and just when the scene was about to get really scary, I leaned forward, completely focused on the screen. \"Why do horror movies always get interesting at the worst moment?\" I told myself with a grin.",
                "At that time, I had no idea that this calm, ordinary afternoon was about to end. What I thought would be just another boring holiday day was actually the beginning of something much bigger—something that would pull me far away from comfort, safety, and everything familiar.",
                "And then, the phone rang. The ringing cut through the silence like a knife."
            ]
        },
        {
            pageNum: 5,
            type: "story",
            paragraphs: [
                "\"Who calls at a time like this?\" I thought, annoyed, as the phone kept ringing louder and louder. Ring... riiing... riiiiing!\nI jumped up from the sofa so fast that I almost tripped. \"Ouch!\" I muttered, rubbing my foot, and rushed to pick up the phone.",
                "\"Hello? Arjun speaking,\" I said, trying to sound calm.",
                "Before I could say anything else, a loud and excited voice exploded from the other side. \"Arjun! I found it!\"\nI pulled the phone slightly away from my ear. \"Why does he always shout like the world is ending?\" I complained in my mind.\n\"Found what?\" I asked, confused."
            ]
        },
        {
            pageNum: 6,
            type: "story",
            paragraphs: [
                "There was a short pause, and then Vikram spoke again, this time with excitement clearly bursting through his words. \"The map... and something else. A locket.\"",
                "My heart skipped a beat. \"A map? A locket? This doesn't sound normal at all,\" I thought.\nBefore I could ask more, I already knew—this phone call was not ordinary. Something had changed, and there was no turning back now.\nI stood still, holding the phone tightly, trying to understand what Vikram had just said.\n\"A map? A locket?\" I repeated slowly.\n\"Yes!\" Vikram replied. \"I found them in the ruins of the old museum.\""
            ]
        },
        {
            pageNum: 7,
            type: "story",
            paragraphs: [
                "My mind started racing. \"Ruins? Museum? Since when does my brother casually find treasure like this?\" I thought.",
                "Before I could ask anything else, Vikram went on talking excitedly, explaining how strange the place was and how old everything looked. I could almost imagine him standing among broken walls and dusty rooms, smiling like he always does when he discovers something new.\n\"This sounds exactly like the stories I read,\" I told myself, feeling a mix of fear and excitement.\nThen Vikram said something that made my heart pound.\n\"I'm coming home today. And this time... you're coming with me.\""
            ]
        },
        {
            pageNum: 8,
            type: "story",
            paragraphs: [
                "I didn't answer immediately. My grip on the phone tightened.\n\"A real adventure... with Vikram?\" I whispered in my mind.\nBefore I could even think properly, the call ended. I slowly placed the phone down, staring at the wall, knowing one thing for sure—my ordinary holidays were officially over.",
                "That evening, the excitement refused to leave me. I barely touched my food as we sat at the dinner table. My mind was still stuck on Vikram's words.\n\"A map... a locket... and an adventure,\" I kept repeating to myself.\nMy parents noticed my silence and curious smile."
            ]
        },
        {
            pageNum: 9,
            type: "character",
            name: "Vikram",
            bio: "Vikram is elder brother. He is 24 years old. He loves adventure and he is also fond of finding treasures. He is very brave and sporty, in fact he has won many sports competitions in his school time."
        },
        {
            pageNum: 10,
            type: "story",
            paragraphs: [
                "\"You look unusually happy today,\" my mother said.\nI finally told them everything—about Vikram's call, the ruins, and the treasure map. They listened carefully, and instead of scolding me, they smiled.\nJust then, my father asked calmly, \"So... where exactly are you both going?\"\nThe smile on my face slowly faded. I froze.",
                "\"Wait... where ARE we going?\" I thought, my heart sinking slightly.\nIn all the excitement, I had completely forgotten to ask Vikram about the destination. I stayed quiet, hoping the topic would change, but my mind was already racing."
            ]
        },
        {
            pageNum: 11,
            type: "lore",
            title: "Ruins of Museum",
            text: "The ruins of the museum, where Vikram found the treasure map and the strange locket, still whispered tales of the past. The broken walls seemed to hide old secrets, pointing brave adventurers toward magical journeys."
        },
        {
            pageNum: 12,
            type: "story",
            paragraphs: [
                "That night, sleep refused to come. I kept staring at the ceiling, thinking about maps, forests, and unknown dangers.",
                "\"I really should have asked him,\" I scolded myself.\nI must have finally fallen asleep sometime near morning, because when I opened my eyes again, sunlight was already filling my room. I checked the clock and sat up straight.",
                "\"What?! How did I sleep this long?\" I thought in shock.\nThe house felt unusually quiet. No footsteps. No voices. Just silence. I walked out of my room and slowly went downstairs."
            ]
        },
        {
            pageNum: 13,
            type: "story",
            paragraphs: [
                "That's when I saw it. Vikram's travel bag was lying on the sofa.\n\"He was here... but where did he go?\" I wondered.\nI looked around the house, checking every room, but Vikram was nowhere to be seen. A strange mix of excitement and confusion filled my mind. Finally, I went to the kitchen where my mother was busy with her work.",
                "\"Mom, where's Vikram?\" I asked.\nShe smiled and replied, \"He went to the market to buy things for your trip.\"",
                "My heart jumped.\n\"So it's really happening,\" I told myself, feeling a rush of energy."
            ]
        },
        {
            pageNum: 14,
            type: "story",
            paragraphs: [
                "Without wasting another second, I grabbed my bicycle and rushed outside, ready to meet Vikram and help him prepare for the adventure that was now clearly unavoidable.\nI rushed out of the house, jumped onto my bicycle, and pedaled as fast as I could. The wind hit my face, but I didn't slow down.",
                "\"If he's buying adventure stuff, I have to be there,\" I told myself.\nWhen I reached the market, I spotted Vikram almost immediately. He was standing near a shop with a cart filled with all kinds of equipment—ropes, bags, containers, and things I couldn't even recognize.\n\"Looks like you're preparing for a war,\" I said, catching my breath."
            ]
        },
        {
            pageNum: 15,
            type: "story",
            paragraphs: [
                "Vikram laughed. \"Adventure is no less than that.\"\nI helped him collect the remaining items, and soon the cart was overflowing.",
                "\"This is getting serious,\" I thought, feeling both nervous and thrilled.\nAfter everything was packed, we returned home. Vikram told me to keep the equipment in his room and then come to the sofa.",
                "\"I want to show you something properly,\" he said.\nWhen I returned, he pulled out an old paper roll from his bag. The paper looked fragile and ancient. As he slowly opened it, my heart began to race."
            ]
        },
        {
            pageNum: 16,
            type: "relics",
            title1: "Treasure Map",
            desc1: "An ancient circular navigation parchment etched with compass points and celestial markings, guiding seekers toward the heart of Navrang Van.",
            title2: "Mysterious Locket",
            desc2: "A finely crafted golden medallion cradling a glowing celestial blue diamond at its center, pulsating with latent arcane resonance."
        },
        {
            pageNum: 17,
            type: "story",
            paragraphs: [
                "Vikram carefully spread the paper on the table. The map looked old, with faded ink, strange symbols, and lines drawn across it like a puzzle.\n\"This doesn't look like something made recently,\" I thought, leaning closer.\n\"This is what I found in the museum ruins,\" Vikram said. \"It shows the path to a treasure.\"\nMy eyes followed the markings until they stopped at one place marked boldly in the center.\nAn ancient temple.\n\"It's hidden deep inside a magical forest called Navrang Van,\" Vikram continued.",
                "My heartbeat grew faster.\n\"A magical forest... this is no longer just a story,\" I told myself."
            ]
        },
        {
            pageNum: 18,
            type: "story",
            paragraphs: [
                "Before I could ask more, Vikram reached into his bag again. This time, he took out a small object wrapped in cloth.\nHe slowly unwrapped it.\nInside was a beautiful locket with a shining blue diamond at its center. Light reflected off its surface, making it glow softly.\n\"Wow...\" I whispered without realizing.\nVikram smiled and placed the locket in my hand. \"It's yours.\"\nI stared at him, shocked.\n\"Mine? Really?\" I thought, my chest filling with happiness.\nI immediately ran to show it to my mother. She smiled and said it looked lovely, which made me feel even happier."
            ]
        },
        {
            pageNum: 19,
            type: "story",
            paragraphs: [
                "That night, as I lay in bed, my thoughts kept returning to the map, the forest, and the temple waiting somewhere far away.\n\"Navrang Van... what kind of place are you?\" I wondered.",
                "The next day passed in a blur. Vikram was unusually focused, moving around the house with purpose. By evening, he finally spoke.\n\"We leave early tomorrow,\" he said. \"So help me pack.\"\nHe handed me a list. I glanced at it and nodded.\n\"This is actually happening,\" I told myself, feeling a strange mix of fear and excitement.\nI went down to the basement to collect the remaining items."
            ]
        },
        {
            pageNum: 20,
            type: "lore",
            title: "Navrang Van",
            text: "Navrang Van is a land full of wonder and mystery. It has colorful trees, flying horses, walking fish, and even dragons. But hidden beneath all this beauty are monsters, tough challenges, and magical creatures, making it both dangerous and exciting for Arjun's adventure."
        },
        {
            pageNum: 21,
            type: "lore",
            title: "The Heart of Navrang Van",
            text: "In this magical place, the air is filled with enchantment, and every step uncovers something new. The plants and animals create a burst of colors, while the dragons guarding Dhrivanta bring both danger and mystery. Navrang Van is a perfect mix of risky paths and stunning beauty, where Arjun's courage is challenged in a world full of hidden secrets and amazing surprises."
        },
        {
            pageNum: 22,
            type: "story",
            paragraphs: [
                "It was dark inside, and for a moment I hesitated.\n\"Why are basements always scary?\" I thought, then quickly turned on the light.",
                "I picked up the petrol can, flashlight, and axe. From the kitchen, I grabbed a lighter and a can opener. I also packed some clothes from my room before joining Vikram in his room, where he was already arranging everything neatly.",
                "After dinner, we went to bed early. Vikram looked calm, but my mind refused to rest.\n\"What if this adventure is nothing like the stories?\" I wondered.\nSleep finally came."
            ]
        },
        {
            pageNum: 23,
            type: "story",
            paragraphs: [
                "The car moved smoothly along the road as the houses slowly disappeared behind us. Trees began to line the path, growing thicker with every passing minute.\n\"So this is really happening,\" I thought, watching the scenery change.\nNeither of us spoke much during the drive. Vikram seemed focused, while I kept glancing at the map resting safely in his bag. After about half an hour, Vikram slowed the car and finally stopped.\n\"This is as far as we go by car,\" he said.",
                "I stepped out and looked ahead. Tall trees stood close together, their leaves forming a green wall. A narrow path led inside."
            ]
        },
        {
            pageNum: 24,
            type: "story",
            paragraphs: [
                "\"Navrang Van,\" I whispered in my mind, feeling a strange chill.\nWe took our bags from the car and locked it carefully. As soon as we stepped onto the forest path, the air felt different—cooler, heavier, and strangely quiet.",
                "Birds chirped softly, and leaves rustled under our feet as we walked deeper.\nThat's when I saw him.\nAn old man was sitting under a large tree, completely still, as if he had been waiting for us.\n\"Who is that?\" I thought, slowing my steps.\nHe wore a long black robe, and his hood covered his face. In his hand was a wooden stick that looked more like a staff."
            ]
        },
        {
            pageNum: 25,
            type: "profile",
            title: "Mysterious Man",
            text: "A wanderer of forgotten paths, the mysterious man is known by none and remembered by few. He speaks in riddles, vanishes without a trace, and seems to know far more than he should."
        },
        {
            pageNum: 26,
            type: "story",
            paragraphs: [
                "As we came closer, he suddenly lifted his head and spoke in a deep voice,\n\"Welcome to my jungle, young adventurers.\"\nThe old man slowly stood up, leaning on his stick. Even though his face was hidden, I felt like his eyes were fixed on me.\n\"Why does it feel like he knows us?\" I thought uneasily.\nThen he spoke, his voice calm yet powerful—",
                "\"I know the wish within your heart,\nI knew your journey from the start.\nI see the shadows on your way,\nI know the price you'll have to pay.\"",
                "I glanced at Vikram, confused.\n\"Did he just... rhyme?\" I asked myself."
            ]
        },
        {
            pageNum: 27,
            type: "story",
            paragraphs: [
                "Before we could question him, he continued—\n\"I am the one who shows the way,\nTo those who're lost or gone astray.\nI help the ones who call my name,\nBut in the end, I play my game.\"\n\"Why is he talking like a poem?\" I wondered.",
                "\"This is just the start, not the end,\nA path unknown, around each bend.\nA serpent waits where shadows grow,\nThere's more ahead than what you know.\"",
                "My heart skipped a beat.\n\"A serpent?\" I thought nervously.\nVikram finally spoke, asking him to explain. The man raised his stick slightly and said—"
            ]
        },
        {
            pageNum: 28,
            type: "story",
            paragraphs: [
                "\"Shhh... stay still, let the forest speak.\nClose your eyes, let silence peak.\"\nWe hesitated.",
                "\"Is he serious?\" I asked myself.\nBut something about his voice made us listen.",
                "We closed our eyes.\nA sudden gust of wind passed by, carrying the smell of flowers, wet soil, and fresh leaves. The forest went completely silent.\nWhen we opened our eyes—\nThe man was gone.",
                "No sound. No movement. Nothing.\n\"Did he just vanish?\" I thought, my heart racing."
            ]
        },
        {
            pageNum: 29,
            type: "story",
            paragraphs: [
                "For a few seconds, neither of us spoke. I slowly turned in a circle, hoping to see the old man somewhere nearby. Nothing.\nThe forest looked the same as before—trees, leaves, and shadows—but the silence felt heavier now.\n\"Did that really just happen?\" I asked myself, still trying to understand it.",
                "\"Did you see that?\" I finally asked Vikram.\nHe nodded calmly. \"Yeah.\"\n\"That man just vanished!\" I said.\n\"And he was talking about serpents and shadows!\"\nVikram adjusted his bag and smiled slightly. \"Strange people are common on adventures.\""
            ]
        },
        {
            pageNum: 30,
            type: "story",
            paragraphs: [
                "I had so many questions, but Vikram didn't seem worried at all. Instead, he looked ahead at the forest path, as if nothing unusual had happened.\n\"How can he be so relaxed?\" I wondered.\nStill, deep inside, I felt something had changed. The man's words echoed in my head, especially the part about a serpent waiting in the shadows.",
                "\"This journey won't be easy,\" I realized.\nBut instead of fear, I felt excitement growing stronger.\nVikram started walking deeper into the forest. I stood still for a moment, took a deep breath, and then ran after him."
            ]
        },
        {
            pageNum: 31,
            type: "story",
            paragraphs: [
                "And just like that, our journey through Navrang Van truly began.\nAs we walked deeper into Navrang Van, the forest slowly revealed its wonders. Tall trees surrounded us, their branches blocking most of the sunlight. The air smelled fresh, mixed with damp soil and leaves.\nI noticed plants growing along the path—plants I had never seen before.",
                "\"These weren't even in my potion classes,\" I thought, bending slightly to look closer.",
                "Some had glowing edges on their leaves, while others twisted in strange shapes. A few even seemed to move gently, as if they were alive."
            ]
        },
        {
            pageNum: 32,
            type: "story",
            paragraphs: [
                "I pointed at one of them. \"Vikram, do you know what this is?\"\nHe glanced at it and nodded. \"Yes. That one's rare. Don't touch it.\"\n\"Of course he knows,\" I told myself.\n\"He always does.\"\nI quickly noted the plant in my mind.\n\"My teacher is never going to believe this,\" I thought with a smile.\nAs we continued walking, the forest slowly grew quieter. Even the birds seemed to disappear.\nUp ahead, I could hear the faint sound of flowing water.\n\"Is that a river?\" I wondered.\nVikram stopped walking and looked ahead carefully. \"We're close,\" he said.\nSomething about his tone made my stomach tighten."
            ]
        },
        {
            pageNum: 33,
            type: "lore",
            title: "Nagadhaara",
            text: "Nagadhaara Nadi, a winding river in Navrang Van, flows through a land full of vibrant beauty. Silently curving through the magical forest, its calm waters hold ancient secrets, calling brave souls to discover the hidden magic resting in its quiet depths."
        },
        {
            pageNum: 34,
            type: "story",
            paragraphs: [
                "The sound of flowing water grew louder with every step we took. Soon, the trees opened up, and a wide river appeared before us.",
                "The water moved slowly, shining under the light that filtered through the trees. The place felt calm—but too calm.\n\"Why does this place feel... dangerous?\" I thought, scanning the surface of the river.",
                "Vikram stopped near the bank and tightened the rope on his bag. \"This is Nagadhaara Nadi,\" he said quietly.\nThe name sent a strange chill through me.\n\"That doesn't sound friendly at all,\" I told myself."
            ]
        },
        {
            pageNum: 35,
            type: "story",
            paragraphs: [
                "The river stretched far in both directions, blocking our path completely. There was no bridge. No stepping stones. Just deep, dark water.\nI leaned forward slightly, trying to see beneath the surface.\n\"What if something is hiding down there?\" I wondered.",
                "Suddenly, the water rippled unnaturally, forming circles that moved toward the center of the river. My heart began to pound.\nVikram raised his hand, signaling me to stay back.\n\"Be careful,\" he said. \"This river is guarded.\"\nI swallowed hard.\n\"Guarded by what?\" I thought."
            ]
        },
        {
            pageNum: 36,
            type: "story",
            paragraphs: [
                "Before I could ask, the water began to rise.\nThe river suddenly burst upward, and something massive rose from beneath the water. I stumbled back in fear as a huge serpent emerged, its scales shining dark and smooth.\n\"That... that's not normal,\" I thought, my legs feeling weak.",
                "The serpent lifted its head high above us, water dripping from its body. Its eyes glowed softly, sharp and watchful. The air felt heavy, as if the forest itself had stopped breathing.",
                "\"I am the guardian of this river,\" the serpent said in a deep, echoing voice.\n\"I am Vasuki.\""
            ]
        },
        {
            pageNum: 37,
            type: "story",
            paragraphs: [
                "My heart felt like it was about to jump out of my chest.\n\"So this is the serpent the old man warned us about,\" I realized.\nVikram stepped forward calmly. \"We wish to cross the river.\"\nVasuki looked at us silently for a moment, then spoke again.\n\"To cross Nagadhaara Nadi, you must prove your wisdom.\"\nThe serpent's tail moved slowly through the water.",
                "\"I will ask a riddle. Answer it correctly, and you may pass.\"\nI swallowed hard.\n\"A riddle... now?\" I thought nervously. \"What if we get it wrong?\"\nVasuki's voice echoed once more as he began—"
            ]
        },
        {
            pageNum: 38,
            type: "profile",
            title: "Vasuki",
            text: "Vasuki, the ancient serpent guardian of Nagadhaara Nadi, resides in Navrang Van. Wise and enigmatic, he tests seekers' mettle with challenging riddles, revealing secrets of the enchanted woods."
        },
        {
            pageNum: 39,
            type: "story",
            paragraphs: [
                "\"I twist and turn, a slithery dance.\nMy tail may rattle, giving chance.\nWith scales so smooth, yet danger near—\nWhat am I, a creature to fear?\"",
                "The words hung in the air. The forest was silent.\nMy mind raced.\n\"Okay, calm down... think,\" I told myself.\nI repeated the riddle quietly in my head.\n\"Twist and turn... slithery... scales... danger...\"",
                "I glanced at Vikram.\nHe didn't say a word. He was watching me.\n\"He's letting me do this,\" I realized.\n\"He trusts me.\"\nSuddenly, everything clicked."
            ]
        },
        {
            pageNum: 40,
            type: "story",
            paragraphs: [
                "I stepped forward and looked up at Vasuki. \"The answer is a snake.\"\nFor a moment, there was no response.",
                "Then Vasuki let out a deep, low sound that almost felt like laughter.\n\"Well done, young adventurer,\" he said. \"You have answered correctly.\"\nMy chest felt light.",
                "\"I did it,\" I thought, hardly believing it myself.",
                "\"The river will allow you to pass,\" Vasuki continued. \"But remember—greater challenges lie ahead.\"\nThe serpent slowly sank back into the water, and the river grew calm once again."
            ]
        },
        {
            pageNum: 41,
            type: "story",
            paragraphs: [
                "Vikram looked at me and smiled.\n\"Good job.\"\n\"This is only the beginning,\" I told myself, as we prepared to cross Nagadhaara Nadi.\nWe carefully crossed Nagadhaara Nadi, stepping only where Vikram pointed. The water felt cold around my ankles, but it stayed calm, as if obeying Vasuki's words.",
                "Once we reached the other side, I let out a long breath.\n\"I can't believe we actually crossed it,\" I thought.\nThe forest on this side felt different. The trees stood closer together, and the light barely reached the ground. Even the air felt heavier."
            ]
        },
        {
            pageNum: 42,
            type: "story",
            paragraphs: [
                "Vikram looked around cautiously.\n\"This area isn't safe,\" he said. \"We should keep moving.\"\nAs we walked, the sounds of the forest slowly faded. No birds. No insects. Just silence.\n\"Why does it feel like we're being watched?\" I wondered, glancing over my shoulder.\nWe stopped under a large tree to rest and eat. It was already afternoon, and my legs ached from walking.\n\"So many things have already happened... and it's only the first day,\" I thought.\nAfter a short break, we continued walking deeper into the forest. The shadows grew longer, and the path ahead looked uncertain."
            ]
        },
        {
            pageNum: 43,
            type: "story",
            paragraphs: [
                "Unseen to us, something moved quietly between the trees.\nOur journey was far from over.\nThe sun slowly dipped behind the trees, and the forest began to change colors. Long shadows stretched across the ground, and the air turned cooler.\n\"It's getting dark faster than I expected,\" I thought, tightening the straps of my bag.\n\"We'll stop here for the night,\" Vikram said, looking around. \"No point walking in the dark.\"\nWe cleared a small area under a tree and set up the tent.\nSoon, the soft crackling sound of a small fire filled the quiet space.\nDinner was simple, but I was too tired to complain."
            ]
        },
        {
            pageNum: 44,
            type: "story",
            paragraphs: [
                "As we ate, I kept glancing into the forest.\n\"Why do I feel like someone is nearby?\" I asked myself.\nAfter dinner, we put out the fire and crawled into the tent. The forest was silent again, except for the occasional rustle of leaves.\nSleep came slowly.\nIn the middle of the night, a strange sound woke me up.\nA soft giggle.",
                "\"Did I imagine that?\" I wondered, holding my breath.\nI nudged Vikram gently. \"Did you hear that?\"\nHe listened for a moment. \"Probably just the forest,\" he said calmly."
            ]
        },
        {
            pageNum: 45,
            type: "story",
            paragraphs: [
                "Still uneasy, I peeked out of the tent. The clearing looked normal. Nothing moved.\n\"Maybe I'm just nervous,\" I told myself.\nWe went back to sleep, unaware that the forest around us was far from quiet.\nThe next morning, sunlight filtered through the trees and fell on my face. I opened my eyes slowly and stretched.",
                "\"At least the night is over,\" I thought with relief.\nWe stepped out of the tent and began packing our things. That's when I noticed something strange.\n\"Vikram...\" I said slowly, \"where's the rope?\""
            ]
        },
        {
            pageNum: 46,
            type: "story",
            paragraphs: [
                "He turned and frowned. \"It was right here.\"\nWe looked around quickly. The flashlight was gone. So was the food bag. Half of our equipment had disappeared.\nMy heart started pounding.",
                "\"This is bad... really bad,\" I thought.\nWe searched the area, checking behind trees and inside bushes, but nothing was there. Then I heard laughter. A sharp, mocking laugh.",
                "I looked up. Sitting on a tree branch above us was a strange creature, holding our missing equipment.\nHe had a mischievous grin on his face and swung the rope like a toy."
            ]
        },
        {
            pageNum: 47,
            type: "story",
            paragraphs: [
                "\"Well, well,\" he said, laughing. \"Good morning, travelers!\"\n\"That has to be the one who was giggling last night,\" I realized.\nVikram clenched his fists. \"Who are you?\"\nThe creature bowed dramatically.\n\"The name's Tantrika... and I love pranks!\"\nHe laughed again, hugging our supplies tightly.",
                "Tantrika jumped down from the tree and landed lightly on the ground, still laughing. He hugged our equipment like it was his treasure.",
                "\"If you want this back,\" he said, grinning, \"bring me something sweet, milky, brown, and loved by children.\""
            ]
        },
        {
            pageNum: 48,
            type: "profile",
            title: "Tantrika Trickster",
            text: "Tantrika Trickster, a mischievous forest spirit in Navrang Van, delights in pranks. Brownie-loving and elusive, this playful creature tests adventurers with tricks, adding whimsy to their enchanted journey."
        },
        {
            pageNum: 49,
            type: "story",
            paragraphs: [
                "I blinked.\n\"Sweet... milky... brown?\" I repeated in my mind.\nSuddenly, it clicked.\n\"Chocolate!\" I thought.\nI quickly searched my bag and pulled out a small chocolate bar. \"Is this what you want?\" I asked.\nTantrika's eyes lit up. He snatched it from my hand and ate it happily—but didn't return our equipment.\n\"Hey!\" I protested.\n\"That wasn't the deal!\" I thought angrily.\nTantrika laughed even louder.\n\"Pranks are pranks!\"",
                "That's when Vikram leaned toward me and whispered something. I nodded, understanding his plan."
            ]
        },
        {
            pageNum: 50,
            type: "story",
            paragraphs: [
                "I stepped forward and said seriously,\n\"That chocolate was poisonous.\"\nTantrika froze.\n\"What?!\" he shouted, panic spreading across his face.\n\"Yes,\" I continued calmly. \"Only we have the medicine.\"\nTantrika's smile vanished. Without another word, he dropped all our equipment on the ground.\n\"Here! Take it! Just save me!\" he cried.\nVikram burst out laughing. \"Relax. It was a prank.\"\nTantrika stared at us for a second, then burst into tears and ran away into the forest.\nI picked up our bag and smiled.\n\"I think I'm starting to enjoy this adventure,\" I thought."
            ]
        },
        {
            pageNum: 51,
            type: "story",
            paragraphs: [
                "After collecting our equipment, we tightened our bags and got ready to move again. The forest looked calmer now, as if nothing strange had happened at all.\n\"First a mysterious man, then a giant serpent, and now a prankster,\" I thought. \"What else is waiting for us?\"",
                "We resumed our journey early in the morning. The path was narrow and uneven, but Vikram walked confidently, checking the map from time to time.\nFor nearly an hour, we walked in silence, covering a good distance.\nThe forest slowly began to change again. The trees grew taller, and the air felt warmer."
            ]
        },
        {
            pageNum: 52,
            type: "story",
            paragraphs: [
                "Then we saw it.\nFar ahead, the forest opened into a wide clearing. At the edge of it stood two massive stone gates, old and worn, yet powerful.\n\"Gates? In the middle of a forest?\" I wondered.\nAs we walked closer, my heart started beating faster. Huge shadows moved near the entrances.\nTwo enormous figures stood guard—one at each gate.\nDragons.",
                "Their wings were folded tightly, and their sharp eyes watched our every move. One stood near the left gate, calm and still. The other shifted slightly near the right gate, a faint smirk on its face."
            ]
        },
        {
            pageNum: 53,
            type: "story",
            paragraphs: [
                "Vikram stopped walking.\n\"This is Drakahavan,\" he said quietly.\n\"From here on, one wrong step could be deadly.\"",
                "I swallowed hard.\n\"Two gates... two dragons... this doesn't look simple at all,\" I thought.",
                "The two dragons watched us silently as we stepped closer. Their scales gleamed under the faint light, and the ground felt warm beneath my feet.",
                "\"Okay... don't panic,\" I told myself.\n\"Think.\"\nVikram whispered, \"One of them always tells the truth. The other always lies. Only one gate is safe.\""
            ]
        },
        {
            pageNum: 54,
            type: "lore",
            title: "Drakahavan",
            text: "Drakahavan, the land of dragons, stood as a silent test of wisdom and courage. Guarded by ancient beasts and hidden rules, it was not strength but truth and logic that decided survival. One wrong choice here could lead to a deadly end, while the right path opened the way forward."
        },
        {
            pageNum: 55,
            type: "profile",
            title: "Satyendra & Mithyendra",
            text: "Satyendra and Mithyendra, dragon guardians of Drakahavan, are identical twins. Satyendra speaks only truth, while Mithyendra is a deceiver. Their challenge conceals peril and tests the discernment of adventurers."
        },
        {
            pageNum: 56,
            type: "story",
            paragraphs: [
                "I looked from one dragon to the other. They were identical—same size, same color, same cold stare.\n\"Of course it can't be easy,\" I thought.\nVikram stepped forward and spoke loudly, \"If we ask the other dragon which gate is fake, which one would he point to?\"\nBoth dragons turned their heads at the same time and pointed their claws toward the same gate.\nMy heart skipped.\n\"Both pointing to one gate... that means...\" I thought carefully.",
                "I remembered the trick.\n\"A liar lies about the truth, and the truthful one tells the truth about the lie,\" I reasoned."
            ]
        },
        {
            pageNum: 57,
            type: "story",
            paragraphs: [
                "\"That gate is dangerous,\" I said softly. \"We take the other one.\"\nVikram nodded. \"Exactly.\"\nWe walked toward the opposite gate. The dragons didn't stop us. One of them smiled—though I couldn't tell which.",
                "As we passed through, the air suddenly felt lighter. The forest beyond looked calmer, safer.\nI let out a breath I didn't know I was holding.\n\"We survived... again,\" I thought.\nBehind us, the stone gates slowly closed.\nOur path forward was now clear.\nThe path beyond the gates sloped gently downward. The forest thinned out, and the air grew still, as if even the wind was afraid to move."
            ]
        },
        {
            pageNum: 58,
            type: "story",
            paragraphs: [
                "\"Why does everything feel so quiet all of a sudden?\" I thought.\nAfter walking for some time, the trees finally parted.\nAnd there it was.\nAn ancient temple stood before us, half-covered in vines and moss. Its stone walls were cracked with age, yet it looked strong—like it had been waiting for centuries.",
                "\"So this is where the map was leading us,\" I realized, my heart pounding.\nThe entrance was dark, wide enough to swallow all light. Broken steps led upward, and strange symbols were carved into the walls.",
                "Vikram switched on his flashlight.\n\"Stay close,\" he said."
            ]
        },
        {
            pageNum: 59,
            type: "story",
            paragraphs: [
                "As we stepped inside, the temperature dropped.\nThe sound of our footsteps echoed softly through the hall.\n\"This place feels alive... and not in a good way,\" I told myself.",
                "The beam of the flashlight revealed long corridors, broken pillars, and shadows that seemed to move when I wasn't looking.\nSomewhere deep inside this temple, the treasure was waiting.",
                "The temple smelled of dust and age.\nEvery step we took echoed through the empty halls, making the silence even louder.\n\"I don't like this place at all,\" I thought, gripping my bag tightly."
            ]
        },
        {
            pageNum: 60,
            type: "lore",
            title: "Ancient Temple",
            text: "Hidden deep within Navrang Van, the ancient temple stood silent and forgotten by time. Its broken walls and dark halls guarded secrets meant only for the worthy. Every step inside tested courage, patience, and faith, for the temple revealed its truths only to those who dared to enter."
        },
        {
            pageNum: 61,
            type: "story",
            paragraphs: [
                "Vikram moved carefully, shining his flashlight on the walls. Old carvings covered the stone—symbols, creatures, and scenes from a forgotten time.\n\"Who built this... and why?\" I wondered.\nWe searched room after room. Some were empty, while others were filled with broken statues and fallen pillars. Time had clearly not been kind to this place.",
                "Minutes passed. Then more.\n\"There should be something here,\" Vikram said, checking the map again.\nMy excitement slowly turned into worry.\n\"What if the map is wrong?\" I thought."
            ]
        },
        {
            pageNum: 62,
            type: "story",
            paragraphs: [
                "Just as I was about to suggest taking a break, something caught my eye.\nOn the main wall of the hall, half-hidden behind vines and cracks, was a small opening.\nIt didn't look natural.\nI walked closer and brushed away the dust. The opening on the wall had a very clear shape.\nIt was round.",
                "Fine lines were carved around it, forming strange patterns that looked exactly like the designs on the locket. At the center of the hole was a small circular space, just the size of the blue gemstone.",
                "My breath caught.\n\"This isn't a coincidence,\" I thought."
            ]
        },
        {
            pageNum: 63,
            type: "story",
            paragraphs: [
                "I slowly turned toward Vikram. \"This hole... it matches the locket.\"\nVikram's eyes widened. \"So the locket isn't just jewelry,\" he said quietly. \"It's the key.\"\nVikram carefully took the locket from my neck and held it close to the wall. The blue gemstone at its center began to glow brighter, casting a soft light across the carvings.\n\"It's reacting,\" I thought, my heart pounding.",
                "Slowly, Vikram placed the locket into the circular opening. The fit was perfect. The moment the gemstone touched the center, the wall began to tremble.\nA deep rumbling sound echoed through the temple."
            ]
        },
        {
            pageNum: 64,
            type: "story",
            paragraphs: [
                "I stepped back instinctively.\n\"Please don't collapse... please don't collapse,\" I told myself.",
                "With a loud click, the carvings on the wall shifted. Stone slid against stone, and the wall slowly moved aside, revealing a hidden chamber behind it.\nWarm golden light spilled out.\nInside the chamber sat an old wooden chest, covered in dust but untouched by time. Strange symbols were etched into its surface.\nVikram walked forward and opened it carefully.",
                "My eyes widened.\nThe chest was filled with glittering gems, gold coins, shining pearls, and precious stones of every kind."
            ]
        },
        {
            pageNum: 65,
            type: "story",
            paragraphs: [
                "\"We actually found it,\" I thought in disbelief. \"The treasure is real.\"\nFor a moment, neither of us spoke.\nThe long journey, the dangers, the riddles—it had all led to this.\nVikram closed the chest gently.\n\"Let's go home,\" he said. \"This adventure has given us more than enough.\"",
                "I nodded, smiling.\n\"And somehow... it feels like this is only the beginning,\" I thought.\nAs we stepped out of the temple, the forest felt strangely calm. The sky above was painted with soft evening light, and for a moment, everything felt... peaceful.\n\"It's finally over,\" I thought, breathing deeply."
            ]
        },
        {
            pageNum: 66,
            type: "story",
            paragraphs: [
                "That's when the air around us shifted.\nA familiar presence made my heart skip a beat.\nSlowly, from between the trees, a figure walked forward.\nThe old man.\nHe stood exactly the same as before—black robe, hood shadowing his face, wooden staff resting in his hand.",
                "\"He's back,\" I thought, my excitement returning with fear.\n\"So,\" he said calmly, \"you found the treasure.\"\nVikram stepped forward. \"Who are you?\" he asked firmly. \"And how did you know all this?\"\nThe man smiled slightly."
            ]
        },
        {
            pageNum: 67,
            type: "story",
            paragraphs: [
                "\"I am not a guardian,\" he said. \"Nor a trickster. I am a watcher... and a guide.\"\nHe raised his staff, and the blue gemstone on my locket glowed softly.\n\"Why is the locket reacting to him?\" I wondered.",
                "\"What you found today,\" the man continued, \"is only one piece of something far greater.\"\nHe waved his staff, and glowing paths appeared briefly in the air—five of them, stretching into darkness.",
                "\"Five relics,\" he said. \"Scattered across five different universes.\"\nMy heart raced.\n\"Universes?\" I repeated in my mind."
            ]
        },
        {
            pageNum: 68,
            type: "story",
            paragraphs: [
                "\"You have proven yourselves worthy,\" the man said. \"The journey ahead will be dangerous... but necessary.\"\nThe light vanished. The forest returned to normal.",
                "Before we could ask anything more, the man stepped back.\n\"This was only the beginning,\" he said softly. \"We will meet again.\"\nAnd just like before—\nHe disappeared.\nI looked at Vikram. He looked back at me.\nNeither of us spoke.\nBut we both knew one thing.\n\"Our adventure wasn't ending,\" I thought.\n\"It was just beginning.\""
            ]
        }
    ];

    // Render each page from 1 to 68
    for (const item of pagesData) {
        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        drawPageBorder(page);

        let yCursor = PAGE_HEIGHT - 65;

        if (item.type === "character") {
            // Character Card
            const titleWidth = timesBold.widthOfTextAtSize(item.name, 22);
            page.drawText(item.name, {
                x: (PAGE_WIDTH - titleWidth) / 2,
                y: yCursor,
                size: 22,
                font: timesBold,
                color: darkBrown
            });
            yCursor -= 28;

            page.drawText("~ ~ ~", {
                x: PAGE_WIDTH / 2 - 12,
                y: yCursor,
                size: 10,
                font: timesRoman,
                color: goldColor
            });
            yCursor -= 40;

            const maxWidth = PAGE_WIDTH - 80;
            const lines = wrapText(item.bio, maxWidth, timesRoman, 12);
            for (const line of lines) {
                page.drawText(line, {
                    x: 42,
                    y: yCursor,
                    size: 12,
                    font: timesRoman,
                    color: bodyColor
                });
                yCursor -= 20;
            }
        } else if (item.type === "lore" || item.type === "profile") {
            // Lore / Creature Profile
            const titleWidth = timesBold.widthOfTextAtSize(item.title, 19);
            page.drawText(item.title, {
                x: (PAGE_WIDTH - titleWidth) / 2,
                y: yCursor,
                size: 19,
                font: timesBold,
                color: darkBrown
            });
            yCursor -= 26;

            page.drawText("~ ~ ~", {
                x: PAGE_WIDTH / 2 - 12,
                y: yCursor,
                size: 10,
                font: timesRoman,
                color: goldColor
            });
            yCursor -= 38;

            const maxWidth = PAGE_WIDTH - 80;
            const lines = wrapText(item.text, maxWidth, timesRoman, 12);
            for (const line of lines) {
                page.drawText(line, {
                    x: 42,
                    y: yCursor,
                    size: 12,
                    font: timesRoman,
                    color: bodyColor
                });
                yCursor -= 20;
            }
        } else if (item.type === "relics") {
            // Treasure Map & Mysterious Locket
            const titleWidth1 = timesBold.widthOfTextAtSize(item.title1, 18);
            page.drawText(item.title1, {
                x: (PAGE_WIDTH - titleWidth1) / 2,
                y: yCursor,
                size: 18,
                font: timesBold,
                color: darkBrown
            });
            yCursor -= 25;

            const lines1 = wrapText(item.desc1, PAGE_WIDTH - 80, timesRoman, 11.5);
            for (const line of lines1) {
                page.drawText(line, {
                    x: 42,
                    y: yCursor,
                    size: 11.5,
                    font: timesRoman,
                    color: bodyColor
                });
                yCursor -= 18;
            }
            yCursor -= 35;

            page.drawText("~ ~ ~", {
                x: PAGE_WIDTH / 2 - 12,
                y: yCursor,
                size: 10,
                font: timesRoman,
                color: goldColor
            });
            yCursor -= 35;

            const titleWidth2 = timesBold.widthOfTextAtSize(item.title2, 18);
            page.drawText(item.title2, {
                x: (PAGE_WIDTH - titleWidth2) / 2,
                y: yCursor,
                size: 18,
                font: timesBold,
                color: darkBrown
            });
            yCursor -= 25;

            const lines2 = wrapText(item.desc2, PAGE_WIDTH - 80, timesRoman, 11.5);
            for (const line of lines2) {
                page.drawText(line, {
                    x: 42,
                    y: yCursor,
                    size: 11.5,
                    font: timesRoman,
                    color: bodyColor
                });
                yCursor -= 18;
            }
        } else {
            // Standard Story Page
            page.drawText("~ ~ ~", {
                x: PAGE_WIDTH / 2 - 12,
                y: yCursor,
                size: 9,
                font: timesRoman,
                color: goldColor
            });
            yCursor -= 32;

            const maxWidth = PAGE_WIDTH - 80;
            for (const para of item.paragraphs) {
                const lines = wrapText(para, maxWidth, timesRoman, 11.5);
                for (const line of lines) {
                    page.drawText(line, {
                        x: 42,
                        y: yCursor,
                        size: 11.5,
                        font: timesRoman,
                        color: bodyColor
                    });
                    yCursor -= 18.5;
                }
                yCursor -= 12;
            }
        }

        // Exact Story Page Number at bottom center matching the original printed page number
        const pageNumStr = `${item.pageNum}`;
        page.drawText(pageNumStr, {
            x: PAGE_WIDTH / 2 - (timesRoman.widthOfTextAtSize(pageNumStr, 11) / 2),
            y: 38,
            size: 11,
            font: timesRoman,
            color: goldColor
        });
    }

    // 4. BACK COVER (Page 71 of PDF)
    const backCover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageBorder(backCover);

    let backY = PAGE_HEIGHT - 130;
    backCover.drawText("~ ~ ~", {
        x: PAGE_WIDTH / 2 - 15,
        y: backY,
        size: 10,
        font: timesRoman,
        color: goldColor
    });
    backY -= 50;

    const blurb = [
        "Enter the magical realm of Navrang Van with Arjun and Vikram, where beauty hides danger and every choice carries a cost.",
        "A forgotten map and a mysterious locket pull the brothers into an adventure filled with riddles, tricksters, serpents, and dragons.",
        "As the forest grows darker, courage and wisdom become their only guides.",
        "Some journeys change the world.",
        "Others change the one who walks them."
    ];

    for (const b of blurb) {
        const lines = wrapText(b, PAGE_WIDTH - 90, timesRoman, 11.5);
        for (const line of lines) {
            backCover.drawText(line, {
                x: 45,
                y: backY,
                size: 11.5,
                font: timesRoman,
                color: bodyColor
            });
            backY -= 19;
        }
        backY -= 14;
    }

    backCover.drawText("Book One of the Arjun's Odyssey Series", {
        x: PAGE_WIDTH / 2 - (timesBold.widthOfTextAtSize("Book One of the Arjun's Odyssey Series", 12) / 2),
        y: 65,
        size: 12,
        font: timesBold,
        color: goldColor
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.resolve("./books/Arjun's Odyssey - Mysteries of Navrang Van.pdf");
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Successfully generated: ${outputPath} (${pdfBytes.length} bytes, ${pdfDoc.getPageCount()} pages)`);
}

generatePDF().catch(console.error);
