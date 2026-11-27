import type { MemberId } from './team'
import type { PlaceId } from '../lib/store'
import type { IconName } from '../components/Icon'

export type CaseId = 'rongmohol' | 'doyani'

export interface Day {
  date: string
  title: string
  text: string
  spoiler?: string
  chapter?: number
}

export interface Person {
  name: string
  bn?: string
  role: string
  truth?: string
  group: string
}

export interface Stop {
  name: string
  bn?: string
  mode: 'train' | 'car' | 'boat' | 'walk'
  time?: string
  note?: string
}

export interface Phenomenon {
  said: string
  bn?: string
  was: string
  cracked: string
  clue?: string
}

export interface CaseFile {
  id: CaseId
  no: string
  bn: string
  en: string
  where: string
  from: string
  to: string
  place: PlaceId
  status: string
  open?: number
  team: MemberId[]
  lead: MemberId
  hook: string
  setup: string[]
  solution: string[]
  phenomena: Phenomenon[]
  days: Day[]
  people: Person[]
  route: { label: string; icon: IconName; stops: Stop[] }[]
  lessons: string[]
  story: boolean
}

export const cases: CaseFile[] = [
  {
    id: 'rongmohol',
    no: '01',
    bn: 'রংমহলের ইট',
    en: 'The Bricks of Rongmohol',
    where: 'Raja Chapitala, Cumilla',
    from: '2026-12-16',
    to: '2026-12-22',
    place: 'chapitala',
    status: 'Closed',
    team: ['fakhru', 'oli', 'moin'],
    lead: 'fakhru',
    hook: 'The village says the Raja’s sunken palace is waking up. Ankle-bells at night, red lights in the fog, pits that refill themselves, and a dog found dead on the mound without a wound.',
    setup: [
      'Raja Chapitala sits in the new Bangra upazila of Cumilla. The union’s own story says a famous Raja lived here around 600 AH, and his palace, Rongmohol, sank into the earth overnight with his whole family. Digging there still brings up red bricks.',
      '600 AH is about 1203 CE, the time of the Pattikera kingdom. Silver Harikela coins from that age turn up in Mainamati hoards. A chief’s brick house from that time is exactly the kind of place that leaves red bricks under a field.',
      'Boro mama’s rule for the week: nobody goes near the Raja’s mound after Maghrib.',
    ],
    solution: [
      'Abdus Salam Sawdagar, the sweet-shop owner and loudest defender of the Raja’s memory, was looting the mound. His fish project drowned in the August 2024 flood, and a re-dig turned up silver coins a Dhaka buyer paid crores for.',
      'He dug from his pond side after moonset and refilled the pits before dawn. Three timer boxes, built by Riaz from the parts Oli carried from Dhaka, played the ankle-bells and flashed the red lights while Salam sat in the mahfil’s front row in front of hundreds of witnesses.',
      'The coins left in his sweet van under ice and rosmalai, boxed as “ঢাকা অর্ডার”. The deepest pit was cutting into the hidden graves of 1971 martyrs, which old Hasmat had been guarding with his lantern.',
      'The police stopped the van at the highway checkpoint on Ahsanul mama’s call, made on our evidence. The mound is now protected.',
    ],
    phenomena: [
      {
        said: 'The dancers’ ankle-bells at 1:30',
        bn: 'রংমহলের নূপুর',
        was: 'Timer boxes looping a file called ghungur_loop.mp3',
        cracked: 'The box in the banyan, its SD card, and a Dhaka price sticker Oli recognised',
        clue: 'r-bells',
      },
      {
        said: 'Red lights in the fog',
        bn: 'রংমহলের বাতি',
        was: 'Red LED strobes on bamboo, plus the diggers’ red-filtered headlamps',
        cracked: 'They only came after moonset, and the strobe repeated on a fixed beat. Fakhru timed it.',
        clue: 'r-lights',
      },
      {
        said: 'Pits that refill themselves',
        bn: 'মাটি নিজে ভরে যায়',
        was: 'Night test pits, filled in before dawn',
        cracked: 'Grey river silt on top of red topsoil, and a dawn drone shot of darker, wetter rectangles',
        clue: 'r-pits',
      },
      {
        said: 'A dog dead without a wound',
        bn: 'দাগহীন মরা কুকুর',
        was: 'Electrocuted on an illegal hook-line to a dewatering pump',
        cracked: 'Singed paw pads and a cut wire stub on a bamboo pole',
        clue: 'r-dog',
      },
      {
        said: 'The red-shawl Raja with a lantern',
        bn: 'লাল চাদরের রাজা',
        was: 'Hasmat Ali, a 1971 freedom fighter, keeping vigil over the martyrs',
        cracked: 'The first trail-cam clip at 11:10 pm: an old man praying',
        clue: 'r-shawl',
      },
      {
        said: 'Blood on a tree',
        was: 'Red tree sap',
        cracked: 'Oli’s thumb',
        clue: 'r-sap',
      },
      {
        said: 'The ground moans',
        bn: 'মাটি গোঙায়',
        was: 'A generator and pump muffled under a tarp',
        cracked: 'Diesel smell and hose drag marks to the canal',
        clue: 'r-moan',
      },
    ],
    days: [
      {
        date: '2026-12-14',
        title: 'Shopping for Riaz',
        text: 'Riaz, the village tinkerer, asks Oli to bring some electrical parts. Oli and Moin buy timer relays, amplifier boards, red LED strips and waterproof boxes in Dhaka.',
        spoiler: 'Every one of those parts ends up inside the ghost machines.',
      },
      {
        date: '2026-12-16',
        title: 'Victory Day bus',
        text: 'The 4 pm bus from Sayedabad, fog after Daudkandi, a CNG from Companiganj to nanur bari. Boro mama’s new rule. At 1:40 am Moin hears faint bells beyond the jungle.',
      },
      {
        date: '2026-12-17',
        title: 'The tea stall',
        text: 'At Mohon kaku’s stall: bells, red lights and Kashem’s dead dog. The kiln owner mocks the ghost story and says he has papers for the mound. Salam the sweet seller shames him and the room applauds. Choto mama tells the legend straight.',
      },
      {
        date: '2026-12-18',
        title: 'Jumu’ah, Hasmat, the box',
        text: 'Choto mama introduces old Hasmat, a 1971 freedom fighter. Faisal straps the trail camera to a jarul tree. That night, down the window grill, they trace the bells to a box lashed inside a hollow.',
        spoiler: 'Inside: a timer, an amplifier board with a Patuatuli sticker, ১৩৫০/-, and an SD card. Oli goes white. “এইগুলা তো আমি কিনছি।”',
      },
      {
        date: '2026-12-19',
        title: 'Footage, then a theft',
        text: 'The trail cam shows an old man praying at 11:10 pm, then a figure with a red headlamp and a spade at 2:14 am. Rosmalai recon at the sweet shop. The kiln owner’s excavator is blocked at dusk. That night the trail cam is stolen.',
        spoiler: 'Moin had copied the footage that morning, as he does every morning.',
      },
      {
        date: '2026-12-20',
        title: 'The coin and the bone',
        text: 'Faisal finds a small silver coin in the outflow mud. Hasmat brings a human jaw fragment he found in the bushes. The case stops being a game. Choto mama insists on the police.',
        spoiler: 'Extraction night: the last mahfil night, an empty village, a double stack of “ঢাকা অর্ডার” boxes. The van is stopped at 4 am.',
      },
      {
        date: '2026-12-21',
        title: 'After Fajr',
        text: 'The UNO, the OC, the whole village and Boro mama, who learns everything at once. Fakhru explains it, point by point.',
      },
      { date: '2026-12-22', title: 'Home', text: 'Mamani cries and makes pitha. Boro mama phones our parents to praise us.' },
    ],
    people: [
      { group: 'Family', name: 'Ashraful mama', bn: 'বড় মামা', role: 'Head of the house and a mahfil organiser that week. The one who must not find out.' },
      { group: 'Family', name: 'Boro mamani', role: 'Feeds everyone and counts heads at Maghrib.' },
      { group: 'Family', name: 'Nazib vai', role: 'Boro mama’s elder son. Studious. Relays the rumours.' },
      { group: 'Family', name: 'Ahsanul mama', bn: 'ছোট মামা', role: 'A mawlana. Warns us, then helps. Makes one phone call at the end.' },
      { group: 'Village', name: 'Faisal', role: 'Darbar worker. Climbs, swims, loyal.' },
      { group: 'Village', name: 'Riaz', role: 'Fixes phones and IPS units. Asked Oli for parts from Dhaka.', truth: 'Built the three boxes for “Salam kaka’s fish project” and had no idea. Became our man inside.' },
      { group: 'Village', name: 'Mohon kaku', role: 'Tea-stall owner. Morning waz on TV, action films at night, and all the gossip.' },
      { group: 'Village', name: 'Hasmat Ali', role: 'Old freedom fighter in a maroon chador with a hurricane lantern. Called mad.', truth: 'Keeping vigil every December night over the hidden graves of the 1971 martyrs.' },
      { group: 'Village', name: 'Kashem', role: 'Farmer. His dog died on the mound.' },
      { group: 'Suspects', name: 'Jalal Bhuiyan', role: 'Brick-kiln owner. Loud, menacing, wants the mound’s soil.', truth: 'A soil thief, fined separately. Not this thief.' },
      { group: 'Suspects', name: 'Abdus Salam Sawdagar', role: 'Owns the sweet shop by the bridge and a fish project next to the mound. The loudest defender of the Raja’s memory.', truth: 'The looter. Flood debt was the motive, timers were the alibi, the sweet van was the exit.' },
      { group: 'Suspects', name: 'Kala Mia', role: 'Salam’s helper. Walks with a slight limp.', truth: 'The masked digger on the trail cam.' },
    ],
    route: [
      {
        label: 'Dhaka to nanur bari',
        icon: 'car',
        stops: [
          { name: 'Sayedabad, Dhaka', mode: 'car', time: '16:00', note: 'Bus' },
          { name: 'Daudkandi', mode: 'car', note: 'The fog starts' },
          { name: 'Companiganj', mode: 'car', note: 'Fruit for the mamas, then a CNG' },
          { name: 'The banyan, the mosque, the mazar', mode: 'walk' },
          { name: 'Nanur bari, Raja Chapitala', mode: 'walk', note: 'Roof room, tin roof, pigeons' },
        ],
      },
    ],
    lessons: [
      'Look first, think later. The blood was sap.',
      'Ghosts do not check moonrise tables. People do.',
      'Copy the footage every morning. Cameras get stolen.',
      'A perfect alibi is a clue, not an answer.',
    ],
    story: false,
  },
  {
    id: 'doyani',
    no: '02',
    bn: 'দোয়ানির ডাক',
    en: 'The Call of the Doyani',
    where: 'Joymoni, the Sundarbans, Dublar Char',
    from: '2027-12-19',
    to: '2027-12-28',
    place: 'mongla',
    status: 'Closed',
    open: 2,
    team: ['nasir', 'fakhru', 'oli', 'moin'],
    lead: 'nasir',
    hook: 'Haji saheb’s boatman Kader was taken by a tiger at a remote confluence the fishermen call the Fairies’ Doyani. No body was found, and his young wife is now shunned as a tiger widow. Then something at the Doyani calls Moin by name, in Nasir’s voice, while Nasir sleeps a foot away.',
    setup: [
      'Haji Abdur Rob Gazi of Joymoni owns seven trawlers and a dried-fish depot on Dublar Char. He is a murid of our great-grandfather’s darbar, Nasir’s patient, and the owner of the Cox’s Bazar shutki shop Nasir has bought from for years.',
      'Nasir said he could not possibly come. He was on the boat when we arrived.',
      'Two months earlier, on Friday 29 October 2027, Kader vanished at the Doyani. A depot hand saw a tiger drag him off a mudbank at low tide, by moonlight.',
    ],
    solution: [
      'No tiger took Kader. Haji saheb’s nephew Shahin, the depot manager, was running a poison-fishing and illegal shutki racket under his uncle’s good name, protected by a pirate gang he paid every month.',
      'Kader found the hidden drying platform. Shahin had him seized at dusk, staged the attack with a slashed vest and deer blood, and put a witness up to swear to it.',
      'The witness was impossible: on the 27th of the lunar month there is no moon at dusk, and on a spring tide the Doyani’s mudbank is under water at Maghrib.',
      'Kader was alive, chained in a forest camp and used as leverage. The Coast Guard freed him on our coordinates. Shahin was caught near the sea mouth.',
    ],
    phenomena: [
      { said: 'A whistle in the dark', bn: 'অন্ধকারে শিস', was: 'Kader himself, whistling from the pirates’ dinghy', cracked: 'Jamal knew the tune. Kader confirmed it.', clue: 'd-whistle' },
      { said: 'Green pin-prick lights', was: 'The pirate leader’s torch', cracked: 'The forest guard’s patrol knowledge', clue: 'd-green' },
      { said: 'A four-toed footprint after the tide', was: 'A living man missing his left little toe', cracked: 'Jamal and Nasir: depth, weight, and the time of the tide', clue: 'd-foot' },
      { said: 'A torn, bloody vest', was: 'Staged with a dao and deer blood', cracked: 'Nasir: clean slanting cuts, no claw rakes, collar intact', clue: 'd-vest' },
      { said: 'Moonlit, at low tide, on the mudbank', was: 'Impossible on that date', cracked: 'Moin read the boat calendar. The skipper knew the tide.', clue: 'd-moon' },
      { said: 'Haji’s boats are never attacked', was: 'Protection money, paid by Shahin', cracked: 'One remark from Ahsanul mama on the phone', clue: 'd-never' },
    ],
    days: [
      { date: '2027-12-13', title: 'Full moon on the roof', text: 'Fakhru is home. Sundarbans or Bandarban. A video call with Ahsanul mama, then Haji saheb, then Nasir, who is on duty and says no.', chapter: 1 },
      { date: '2027-12-19', title: 'The Sundarban Express', text: 'A whole AC-berth cabin from Kamalapur at 08:00, over the Padma Bridge, a two-minute stop at Kushtia Court for Fakhru’s 33rd district, Khulna by 15:50, Joymoni ghat at dusk.', chapter: 2, spoiler: 'Curly hair, panjabi and white payjama, a big bhetki on a plate. Nasir.' },
      { date: '2027-12-19', title: 'Night one', text: 'Haji saheb tells Kader’s story over dinner. At 23:50 a dinghy with no lights passes the ghat, green pin-pricks blink across the river, and someone whistles.', chapter: 3 },
      { date: '2027-12-20', title: 'At the forest’s door', text: 'The forest guard boards and warns that drones are banned. Dolphins in the Pasur, Karamjal, Harbaria, and Oli’s fishing masterclass.', chapter: 4 },
      { date: '2027-12-21', title: 'The Doyani', text: 'A three-way confluence, an old gewa grove, three bamboo-marked graves of tiger-killed fishermen. No birds. The trail cam goes on a bank tree.', chapter: 5, spoiler: 'Night three: the Calling at about 01:40, then the lights.' },
      { date: '2027-12-22', title: 'Footprints in the mud', text: 'A four-toed print pressed in after the night tide, a snare line, a pesticide cap, dead fish on the tide line. The trail cam caught a dinghy at 03:10.', chapter: 6, spoiler: 'A red gamchha and a rower on the left side. Jamal breaks down.' },
      { date: '2027-12-22', title: 'The reddish shutki', text: 'Shahin arrives by speedboat with fuel and a warning. Up a side khal inside the sanctuary: a drying platform, reddish fish, pesticide bottles, deer snares.', chapter: 7 },
      { date: '2027-12-23', title: 'One bar of network', text: 'Deer and pugmarks at Kochikhali. A call with Ahsanul mama from the watchtower. Haji saheb brings out the vest.', chapter: 8, spoiler: 'Nasir: “কাদেরকে বাঘে নেয়নি।”' },
      { date: '2027-12-23', title: 'The moon’s account', text: 'The boat’s calendar, the skipper’s thirty years of tides, and Fakhru’s timeline.', chapter: 9 },
      { date: '2027-12-24', title: 'Kotka', text: 'Watchtower, beach, red crabs. At the forest station Nasir and the guard share coordinates and set a rule: if there is no news by Saturday morning, come to the Doyani.', chapter: 10 },
      { date: '2027-12-24', title: 'Dublar Char', text: 'A six-month town of drying racks. The depot logbook, blue twine, a half-scraped stencil, and a phone call Oli was not meant to hear.', chapter: 11 },
      { date: '2027-12-25', title: 'Fog', text: 'Oli and Jamal take the dinghy 150 m to fetch the trail cam. The fog closes. They vanish.', chapter: 12 },
      { date: '2027-12-25', title: 'The forbidden sky', text: 'When the fog thins, Nasir says “মঈন, ড্রোন।” Moin is airborne within a minute. Nobody asks permission.', chapter: 13 },
      { date: '2027-12-25', title: 'Kader', text: 'Moin guides from the deck by drone and walkie-talkie. Oli cuts the pirates’ boat loose. The Coast Guard reaches the camp.', chapter: 14, spoiler: 'Kader is alive.' },
      { date: '2027-12-25', title: 'The explanation', text: 'At Kotka that evening, Nasir explains it, clue by clue.', chapter: 15 },
      { date: '2027-12-25', title: 'Night seven', text: 'Back at the Doyani with the Coast Guard alongside and every suspect accounted for.', chapter: 16, spoiler: 'The lights come back. So does a voice. Nasir gives the adhan.' },
      { date: '2027-12-28', title: 'Jahanabad Express', text: 'Khulna at 06:00 in a whole cabin. Fakhru steps onto the platform at Narail for district 34. Nasir sleeps across the Padma.', chapter: 16 },
    ],
    people: [
      { group: 'Joymoni', name: 'Haji Abdur Rob Gazi', role: 'Seven trawlers, a depot on Dublar Char, our great-grandfather’s murid and Nasir’s patient. Insists on going to the Doyani.', truth: 'Not a cover-up. Guilt. He had pushed Kader to fish there that day after the old skipper refused.' },
      { group: 'Joymoni', name: 'Shahin Molla', role: 'His sister’s son. Runs the depot since Haji saheb’s surgery. Charming, helpful, everywhere.', truth: 'The culprit. Poison fishing, illegal shutki and protection money, all under his uncle’s name.' },
      { group: 'Joymoni', name: 'Rahela', role: 'Kader’s wife. Shunned as a tiger widow. Tells Nasir quietly, “ও আমারে ডাকে।”' },
      { group: 'Crew of the M.B. Siraji', name: 'Alauddin, skipper', bn: 'আলাউদ্দিন সারেং', role: 'Thirty years on these rivers. Knows the tides by heart, and the stories.' },
      { group: 'Crew of the M.B. Siraji', name: 'Mofiz', role: 'Cook. Terrified of jinn. Brilliant with চুইঝাল.' },
      { group: 'Crew of the M.B. Siraji', name: 'Jamal', role: 'Deckhand. Kader’s best friend. Knows his whistle, his gamchha and his foot.' },
      { group: 'Forest', name: 'Rafiqul Islam', role: 'Forest guard with a shotgun. Slips away to call at every scrap of network.', truth: 'His wife was in labour in Khulna and his leave was refused. A daughter, Banani, born 25 December.' },
      { group: 'Depot', name: 'Bachchu', role: 'Depot hand. The eyewitness to the tiger.', truth: 'Slashed the vest himself and lied about the moon.' },
      { group: 'Depot', name: 'Abdul Kader', role: 'The boatman the tiger took. Left-handed, missing his left little toe, always in the red gamchha his wife wove.', truth: 'Alive. Chained at night and made to dry the poisoned fish.' },
      { group: 'Off-site', name: 'Ahsanul mama', role: 'Waz season, so phone only, and only where there is network. Context and counsel.' },
      { group: 'Fictional gang', name: 'জোনাক বাহিনী', role: 'A pirate gang. Its leader moves at night with a pin-prick green torch.' },
    ],
    route: [
      {
        label: 'Sundarban Express 726, one whole cabin',
        icon: 'train',
        stops: [
          { name: 'Kamalapur, Dhaka', mode: 'train', time: '08:00' },
          { name: 'Padma Bridge', mode: 'train' },
          { name: 'Bhanga', mode: 'train' },
          { name: 'Faridpur', mode: 'train' },
          { name: 'Rajbari', mode: 'train' },
          { name: 'Kushtia Court', mode: 'train', note: 'Two minutes. District 33.' },
          { name: 'Poradah', mode: 'train' },
          { name: 'Jashore', mode: 'train' },
          { name: 'Khulna', mode: 'train', time: '15:50', note: '10 minutes late in the fog' },
        ],
      },
      {
        label: 'By road and river',
        icon: 'boat',
        stops: [
          { name: 'Joymoni ghat', mode: 'car', time: '17:25', note: 'Microbus via Mongla and Chila' },
          { name: 'Karamjal', mode: 'boat' },
          { name: 'Harbaria', mode: 'boat' },
          { name: 'পরীর দোয়ানি', mode: 'boat', note: 'Not on any map. Chandpai range.' },
          { name: 'Sela river, Supati', mode: 'boat' },
          { name: 'Kochikhali', mode: 'boat', note: 'One bar of network' },
          { name: 'Kotka', mode: 'boat' },
          { name: 'Dublar Char, Alorkol', mode: 'boat' },
          { name: 'Back to the Doyani', mode: 'boat' },
          { name: 'Up the Pasur to Joymoni', mode: 'boat' },
        ],
      },
      {
        label: 'Jahanabad Express 825, one whole cabin',
        icon: 'train',
        stops: [
          { name: 'Khulna', mode: 'train', time: '06:00' },
          { name: 'Narail', mode: 'train', note: 'District 34' },
          { name: 'Padma Bridge', mode: 'train' },
          { name: 'Dhaka', mode: 'train', time: '09:45' },
        ],
      },
    ],
    lessons: [
      'Check the moon before you believe a witness.',
      'Ask the skipper. Thirty years of tides beat any app.',
      'A tiger leaves rakes and punctures. A dao leaves one clean line.',
      'Pin coordinates. Patrols need numbers, not descriptions.',
    ],
    story: true,
  },
]

export const caseById = Object.fromEntries(cases.map((c) => [c.id, c])) as Record<CaseId, CaseFile>
