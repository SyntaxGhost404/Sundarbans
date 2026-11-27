export interface District {
  id: string
  en: string
  bn: string
}

export interface Division {
  id: string
  en: string
  bn: string
  districts: District[]
}

const d = (en: string, bn: string): District => ({ id: en.toLowerCase().replace(/[^a-z]/g, ''), en, bn })

export const divisions: Division[] = [
  {
    id: 'barishal',
    en: 'Barishal',
    bn: 'বরিশাল',
    districts: [
      d('Barguna', 'বরগুনা'),
      d('Barishal', 'বরিশাল'),
      d('Bhola', 'ভোলা'),
      d('Jhalokati', 'ঝালকাঠি'),
      d('Patuakhali', 'পটুয়াখালী'),
      d('Pirojpur', 'পিরোজপুর'),
    ],
  },
  {
    id: 'chattogram',
    en: 'Chattogram',
    bn: 'চট্টগ্রাম',
    districts: [
      d('Bandarban', 'বান্দরবান'),
      d('Brahmanbaria', 'ব্রাহ্মণবাড়িয়া'),
      d('Chandpur', 'চাঁদপুর'),
      d('Chattogram', 'চট্টগ্রাম'),
      d('Cox’s Bazar', 'কক্সবাজার'),
      d('Cumilla', 'কুমিল্লা'),
      d('Feni', 'ফেনী'),
      d('Khagrachhari', 'খাগড়াছড়ি'),
      d('Lakshmipur', 'লক্ষ্মীপুর'),
      d('Noakhali', 'নোয়াখালী'),
      d('Rangamati', 'রাঙ্গামাটি'),
    ],
  },
  {
    id: 'dhaka',
    en: 'Dhaka',
    bn: 'ঢাকা',
    districts: [
      d('Dhaka', 'ঢাকা'),
      d('Faridpur', 'ফরিদপুর'),
      d('Gazipur', 'গাজীপুর'),
      d('Gopalganj', 'গোপালগঞ্জ'),
      d('Kishoreganj', 'কিশোরগঞ্জ'),
      d('Madaripur', 'মাদারীপুর'),
      d('Manikganj', 'মানিকগঞ্জ'),
      d('Munshiganj', 'মুন্সিগঞ্জ'),
      d('Narayanganj', 'নারায়ণগঞ্জ'),
      d('Narsingdi', 'নরসিংদী'),
      d('Rajbari', 'রাজবাড়ী'),
      d('Shariatpur', 'শরীয়তপুর'),
      d('Tangail', 'টাঙ্গাইল'),
    ],
  },
  {
    id: 'khulna',
    en: 'Khulna',
    bn: 'খুলনা',
    districts: [
      d('Bagerhat', 'বাগেরহাট'),
      d('Chuadanga', 'চুয়াডাঙ্গা'),
      d('Jashore', 'যশোর'),
      d('Jhenaidah', 'ঝিনাইদহ'),
      d('Khulna', 'খুলনা'),
      d('Kushtia', 'কুষ্টিয়া'),
      d('Magura', 'মাগুরা'),
      d('Meherpur', 'মেহেরপুর'),
      d('Narail', 'নড়াইল'),
      d('Satkhira', 'সাতক্ষীরা'),
    ],
  },
  {
    id: 'mymensingh',
    en: 'Mymensingh',
    bn: 'ময়মনসিংহ',
    districts: [d('Jamalpur', 'জামালপুর'), d('Mymensingh', 'ময়মনসিংহ'), d('Netrokona', 'নেত্রকোনা'), d('Sherpur', 'শেরপুর')],
  },
  {
    id: 'rajshahi',
    en: 'Rajshahi',
    bn: 'রাজশাহী',
    districts: [
      d('Bogura', 'বগুড়া'),
      d('Chapainawabganj', 'চাঁপাইনবাবগঞ্জ'),
      d('Joypurhat', 'জয়পুরহাট'),
      d('Naogaon', 'নওগাঁ'),
      d('Natore', 'নাটোর'),
      d('Pabna', 'পাবনা'),
      d('Rajshahi', 'রাজশাহী'),
      d('Sirajganj', 'সিরাজগঞ্জ'),
    ],
  },
  {
    id: 'rangpur',
    en: 'Rangpur',
    bn: 'রংপুর',
    districts: [
      d('Dinajpur', 'দিনাজপুর'),
      d('Gaibandha', 'গাইবান্ধা'),
      d('Kurigram', 'কুড়িগ্রাম'),
      d('Lalmonirhat', 'লালমনিরহাট'),
      d('Nilphamari', 'নীলফামারী'),
      d('Panchagarh', 'পঞ্চগড়'),
      d('Rangpur', 'রংপুর'),
      d('Thakurgaon', 'ঠাকুরগাঁও'),
    ],
  },
  {
    id: 'sylhet',
    en: 'Sylhet',
    bn: 'সিলেট',
    districts: [d('Habiganj', 'হবিগঞ্জ'), d('Moulvibazar', 'মৌলভীবাজার'), d('Sunamganj', 'সুনামগঞ্জ'), d('Sylhet', 'সিলেট')],
  },
]

export const allDistricts = divisions.flatMap((v) => v.districts.map((x) => ({ ...x, division: v.id })))

export const fakhru = {
  count: 34,
  rule: { bn: 'নিয়ম হলো মাটিতে পা রাখতে হবে। ট্রেনের জানালা দিয়ে দেখা জেলা জেলা না।', en: 'Your feet have to touch the ground. A district seen from a train window is not a district.' },
  ticks: [
    { n: 33, district: 'Kushtia', note: 'Two minutes at Kushtia Court. “লালনের জেলা।”' },
    { n: 34, district: 'Narail', note: 'Two minutes at Narail on the way home.' },
  ],
  never: 'পরীর দোয়ানি: টিক দেওয়া যাবে না।',
}
