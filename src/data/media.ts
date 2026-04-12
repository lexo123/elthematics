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

function createShuffledQueue<T>(items: T[]): () => T {
  let queue: T[] = [];
  let lastItem: T | null = null;
  
  const shuffle = (array: T[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  return () => {
    if (queue.length === 0) {
      queue = shuffle(items);
      if (items.length > 1 && queue[queue.length - 1] === lastItem) {
        const first = queue.pop()!;
        queue.unshift(first);
      }
    }
    lastItem = queue.pop()!;
    return lastItem;
  };
}

export const getRandomGoodImage = createShuffledQueue(goodImages);
export const getRandomBadImage = createShuffledQueue(badImages);
export const getRandomGif = createShuffledQueue(gifs);
}
