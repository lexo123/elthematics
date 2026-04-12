// აქ შეგიძლიათ ჩასვათ თქვენი სურათების და გიფების ლინკები (URL) და შესაბამისი წარწერები

export interface MediaItem {
  url: string;
  caption: string;
}

// კარგი სურათები (როცა 3-ვე პასუხი სწორია)
export const goodImages: MediaItem[] = [
  { url: "ballet.png", caption: "ნამდვილი ბალერინა ხარ!" },
  { url: "champion.png", caption: "ჩემპიონი ხარ!" },
//  { url: "/hero.png", caption: "მათემატიკის სუპერგმირი ხარ!" },
  { url: "queens.png", caption: "დედოფალი და პრინცი" },
  { url: "scientist.png", caption: "ნამდვილი მეცნიერი ყოფილხარ!" },
  { url: "stitch.webp", caption: "ელუ და სტიჩი" },
  { url: "teatcher.png", caption: "ელთემატიკის პროფესორი ხარ" },
//  { url: "/tiger.png", caption: "ვეფხვების მომთვინიერებელი" },
  { url: "wednesday.png", caption: "ვენსდეი ცინაძე" },
  { url: "paparazzi.png", caption: "სუპერვარსკვლავი ხარ" },
];

// ცუდი სურათები (როცა 3-დან 1 მაინც არასწორია)
export const badImages: MediaItem[] = [
  { url: "old.png", caption: "მათემატიკოსი კი არა ჩვეულებრივი ბებრუხანა ხარ" },
  { url: "fat.png", caption: "უბრალოდ მსუქანა ყოფილხარ" },
  { url: "badscientist.png", caption: "ბანძი მეცნიერი ყოფილხარ" },
  { url: "phone.png", caption: "ხო ხედავ ამდენი ტიკტოკისგან თავი ტელეფონად გადაგექცა" },
  { url: "monkey.png", caption: "მათემატიკური მაიმუნი ხარ" },
];

// გიფები (როცა ზედიზედ 9 პასუხი სწორია)
export const gifs: MediaItem[] = [
  { url: "zeus.gif", caption: "მათემატიკის ზევსი ხარ! 🎉" },
  { url: "tiger.gif", caption: "ვეფხვების მომთვინიერებელი ხარ! 🎉" },
  { url: "hero.gif", caption: "მათემატიკის სუპერგმირი! 🎉" },
];

// დამხმარე ფუნქციები შემთხვევითი სურათის ასარჩევად
export const getRandomGoodImage = (): MediaItem => goodImages[Math.floor(Math.random() * goodImages.length)];
export const getRandomBadImage = (): MediaItem => badImages[Math.floor(Math.random() * badImages.length)];
export const getRandomGif = (): MediaItem => gifs[Math.floor(Math.random() * gifs.length)];
