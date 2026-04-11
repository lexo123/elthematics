import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRandomGoodImage, getRandomBadImage, getRandomGif, MediaItem } from './data/media';

type GameMode = 'menu' | 'elthematics' | 'multiplication' | 'elometria';

interface GeometryData {
  type: 'perimeter' | 'area' | 'count';
  numSides: number;
  isRegular: boolean;
  sideLengths: number[];
  questionText: string;
  points: {x: number, y: number}[];
}

interface Question {
  expression: { num: number, op?: string }[];
  ans: number;
  missingIndex: number;
  correctInput: number;
  isGeometry?: boolean;
  geometryData?: GeometryData;
}

// მათემატიკური კითხვის გენერატორი (9 წლის ბავშვისთვის, 100-ის ფარგლებში)
const generateMathQuestion = (): Question => {
  const types = ['+', '-', '*', '/', '3-num'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let expression: { num: number, op?: string }[] = [];
  let ans = 0;

  if (type === '3-num') {
    let a = Math.floor(Math.random() * 50) + 10;
    let op1 = Math.random() < 0.5 ? '+' : '-';
    let b = Math.floor(Math.random() * 30) + 5;
    
    if (op1 === '-') {
      b = Math.floor(Math.random() * (a - 5)) + 1;
    }
    let tempAns = op1 === '+' ? a + b : a - b;
    
    let op2 = Math.random() < 0.5 ? '+' : '-';
    let c = 0;
    if (op2 === '+') {
      let maxC = 100 - tempAns;
      if (maxC < 5) maxC = 5;
      c = Math.floor(Math.random() * Math.min(30, maxC)) + 1;
      ans = tempAns + c;
    } else {
      c = Math.floor(Math.random() * (tempAns - 1)) + 1;
      ans = tempAns - c;
    }
    expression = [{num: a}, {op: op1, num: b}, {op: op2, num: c}];
  } else if (type === '+') {
    ans = Math.floor(Math.random() * 81) + 20; // 20 დან 100 მდე
    let a = Math.floor(Math.random() * (ans - 10)) + 5; // 5 დან ans-5 მდე
    let b = ans - a;
    expression = [{num: a}, {op: '+', num: b}];
  } else if (type === '-') {
    let a = Math.floor(Math.random() * 81) + 20; // 20 დან 100 მდე
    let b = Math.floor(Math.random() * (a - 5)) + 5; // 5 დან a-5 მდე
    ans = a - b;
    expression = [{num: a}, {op: '-', num: b}];
  } else if (type === '*') {
    let a = Math.floor(Math.random() * 9) + 2; // 2 დან 10 მდე
    let b = Math.floor(Math.random() * 9) + 2;
    ans = a * b;
    expression = [{num: a}, {op: '*', num: b}];
  } else if (type === '/') {
    let b = Math.floor(Math.random() * 9) + 2; // 2 დან 10 მდე
    ans = Math.floor(Math.random() * 9) + 2; // 2 დან 10 მდე
    let a = b * ans; // უნაშთო გაყოფა, მაქსიმუმ 100
    expression = [{num: a}, {op: '/', num: b}];
  }
  
  const rand = Math.random();
  let missingIndex = -1;
  let correctInput = ans;

  if (expression.length === 2 && rand < 0.3) {
    missingIndex = Math.floor(Math.random() * expression.length);
    correctInput = expression[missingIndex].num;
  }

  return { expression, ans, missingIndex, correctInput };
};

// გამრავლების ტაბულის გენერატორი (1-დან 10-მდე)
const generateMultiplicationQuestion = (): Question => {
  const isMultiplication = Math.random() > 0.5;
  let expression: { num: number, op?: string }[] = [];
  let ans = 0;

  if (isMultiplication) {
    let a = Math.floor(Math.random() * 10) + 1; // 1 დან 10 მდე
    let b = Math.floor(Math.random() * 10) + 1; // 1 დან 10 მდე
    ans = a * b;
    expression = [{num: a}, {op: '*', num: b}];
  } else {
    let b = Math.floor(Math.random() * 10) + 1; // 1 დან 10 მდე
    ans = Math.floor(Math.random() * 10) + 1; // 1 დან 10 მდე
    let a = b * ans; // უნაშთო გაყოფა
    expression = [{num: a}, {op: '/', num: b}];
  }

  return { expression, ans, missingIndex: -1, correctInput: ans };
};

const generateGeometryQuestion = (): Question => {
  const qTypes = ['perimeter', 'area', 'count'];
  const type = qTypes[Math.floor(Math.random() * qTypes.length)];

  let ans = 0;
  let questionText = "";
  let numSides = 3;
  let isRegular = false;
  let sideLengths: number[] = [];

  if (type === 'perimeter') {
    numSides = Math.floor(Math.random() * 4) + 3; // 3 to 6
    isRegular = Math.random() > 0.5;
    
    if (isRegular) {
      const side = Math.floor(Math.random() * 15) + 2;
      sideLengths = Array(numSides).fill(side);
      ans = side * numSides;
      questionText = "იპოვე ფიგურის პერიმეტრი\n(ყველა გვერდი ტოლია)";
    } else {
      for (let i = 0; i < numSides; i++) {
        sideLengths.push(Math.floor(Math.random() * 10) + 2);
      }
      ans = sideLengths.reduce((a, b) => a + b, 0);
      questionText = "იპოვე ფიგურის პერიმეტრი";
    }
  } else if (type === 'area') {
    numSides = 4;
    isRegular = Math.random() > 0.5; // true -> square, false -> rectangle
    if (isRegular) {
      const side = Math.floor(Math.random() * 10) + 2;
      sideLengths = [side, side, side, side];
      ans = side * side;
      questionText = "იპოვე კვადრატის ფართობი\n(ყველა გვერდი ტოლია)";
    } else {
      const w = Math.floor(Math.random() * 10) + 3;
      let h = Math.floor(Math.random() * 10) + 2;
      if (w === h) h += 1;
      sideLengths = [w, h, w, h];
      ans = w * h;
      questionText = "იპოვე მართკუთხედის ფართობი";
    }
  } else if (type === 'count') {
    numSides = Math.floor(Math.random() * 6) + 5; // 5 to 10
    isRegular = Math.random() > 0.5;
    sideLengths = Array(numSides).fill(0);
    ans = numSides;
    const askSides = Math.random() > 0.5;
    questionText = askSides ? "რამდენი გვერდი აქვს ამ ფიგურას?" : "რამდენი კუთხე აქვს ამ ფიგურას?";
  }

  const points = [];
  const centerX = 120;
  const centerY = 120;
  const radius = 80;

  if (type === 'area' && !isRegular) {
    const w = sideLengths[0];
    const h = sideLengths[1];
    const maxDim = Math.max(w, h);
    const scale = 140 / maxDim;
    const drawW = w * scale;
    const drawH = h * scale;
    points.push({x: centerX - drawW/2, y: centerY - drawH/2});
    points.push({x: centerX + drawW/2, y: centerY - drawH/2});
    points.push({x: centerX + drawW/2, y: centerY + drawH/2});
    points.push({x: centerX - drawW/2, y: centerY + drawH/2});
  } else {
    for (let i = 0; i < numSides; i++) {
      const angle = (i * 2 * Math.PI) / numSides - Math.PI / 2;
      let r = radius;
      let a = angle;
      if (!isRegular && type !== 'area') {
         r = radius * (0.75 + Math.random() * 0.25); 
         const angleOffset = (Math.random() - 0.5) * (Math.PI / numSides * 0.6);
         a += angleOffset;
      }
      points.push({
        x: centerX + r * Math.cos(a),
        y: centerY + r * Math.sin(a)
      });
    }
  }

  return {
    expression: [],
    ans,
    missingIndex: -1,
    correctInput: ans,
    isGeometry: true,
    geometryData: {
      type: type as any,
      numSides,
      isRegular,
      sideLengths,
      questionText,
      points
    }
  };
};

const GeometryView = ({ data }: { data: GeometryData }) => {
  const { points, sideLengths, type, isRegular } = data;
  
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const labels = points.map((p1, i) => {
    const p2 = points[(i + 1) % points.length];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    
    const dx = midX - 120;
    const dy = midY - 120;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const nx = dx / dist;
    const ny = dy / dist;
    
    return {
      x: midX + nx * 25,
      y: midY + ny * 25,
      val: sideLengths[i]
    };
  });

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-fuchsia-700 text-center mb-6 whitespace-pre-line">
        {data.questionText}
      </h2>
      <svg width="240" height="240" className="overflow-visible">
        <polygon 
          points={polygonPoints} 
          fill="#fdf4ff" 
          stroke="#d946ef" 
          strokeWidth="4" 
          strokeLinejoin="round"
        />
        {type !== 'count' && labels.map((label, i) => {
          if (isRegular && i !== 0) return null;
          if (type === 'area' && !isRegular && (i === 2 || i === 3)) return null;

          return (
            <text 
              key={i} 
              x={label.x} 
              y={label.y} 
              fill="#a21caf" 
              fontSize="22" 
              fontWeight="bold" 
              textAnchor="middle" 
              dominantBaseline="middle"
            >
              {label.val}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const successPhrases = [
  "ყოჩაღ, ელენე! 💖",
  "გენიოსი ხარ! 🌟",
  "მალადეც ელენე! 🎉",
  "მათემატიკოსი ქალი ხარ! 👩‍🏫",
  "შენ აღარ ხუმრობ! 😎",
  "შეენ ლევანიზე მეტი მათემატიკა გცოდნია! 🤫",
  "ნამდვილი ელთემატიკოსი ხარ! ✨",
  "საააღოლ! 👏"
];

const getFailurePhrase = (input: string) => {
  const phrases = [
    "წესიერად დაითვალე, გოგო! 🤨",
    "ამხელა ქალს ეგ უნდა გეშლებოდეს? 🤦‍♀️",
    `რა ${input}, გოგო, თავიდან გამოთვალე. 🙄`,
    `${input} არა იიის 🤣`,
    `${input} კი არა თუ გაგცხე ეხლა 😠`,
    `${input}-ს მოგცემ მე შენ 😤`
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// აქ უნდა ჩასვათ Google Apps Script-ის ლინკი
const GOOGLE_SCRIPT_URL = ""; 

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  
  const [question, setQuestion] = useState<Question>({ expression: [], ans: 0, missingIndex: -1, correctInput: 0 });
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // თამაშის სტატისტიკა
  const [completedQuestions, setCompletedQuestions] = useState(0); 
  const [correctFirstTry, setCorrectFirstTry] = useState(0); 
  const [streak, setStreak] = useState(0); 
  const [batchCount, setBatchCount] = useState(0); 
  const [batchMistakes, setBatchMistakes] = useState(0); 
  const [mistakeOnCurrent, setMistakeOnCurrent] = useState(false); 
  const [isCorrectAnswered, setIsCorrectAnswered] = useState(false); 

  // ტაიმერი გამრავლების ტაბულისთვის
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // ჯილდოს სტეიტი
  const [reward, setReward] = useState<{ type: 'good' | 'bad' | 'gif' | 'emperor', media?: MediaItem } | null>(null);
  const [emperorDecision, setEmperorDecision] = useState<'alive' | 'dead' | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const sendStatsToGoogle = (mode: string, total: number, correct: number) => {
    if (!GOOGLE_SCRIPT_URL) return;
    
    const modeNames = {
      'elthematics': 'ელთემატიკა',
      'multiplication': 'ელმრავლების ტაბულა',
      'elometria': 'ელომეტრია'
    };
    
    const data = {
      mode: modeNames[mode as keyof typeof modeNames] || mode,
      total: total,
      correct: correct
    };

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data)
    }).catch(err => console.error("Error sending stats:", err));
  };

  const handleBackToMenu = () => {
    if (completedQuestions > 0) {
      sendStatsToGoogle(gameMode, completedQuestions, correctFirstTry);
    }
    setGameMode('menu');
  };

  useEffect(() => {
    if (gameMode !== 'menu' && !reward && !isCorrectAnswered) {
      inputRef.current?.focus();
    }
  }, [reward, question, isCorrectAnswered, gameMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && reward) {
        if (reward.type === 'emperor' && !emperorDecision) {
          return;
        }
        handleNextAfterReward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reward, emperorDecision]);

  // ტაიმერის ლოგიკა
  useEffect(() => {
    if (gameMode !== 'multiplication' || reward || isCorrectAnswered) return;

    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !isTimeUp) {
      setIsTimeUp(true);
      if (!mistakeOnCurrent) {
        setMistakeOnCurrent(true);
        setBatchMistakes(prev => prev + 1);
        setStreak(0);
      }
      setIsError(true);
      setMessage('დრო ამოიწურა! ⏰ სცადე ხელახლა.');
      setUserInput('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [timeLeft, gameMode, reward, isCorrectAnswered, isTimeUp, mistakeOnCurrent]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setCompletedQuestions(0);
    setCorrectFirstTry(0);
    setStreak(0);
    setBatchCount(0);
    setBatchMistakes(0);
    setMistakeOnCurrent(false);
    setIsCorrectAnswered(false);
    setReward(null);
    setEmperorDecision(null);
    
    if (mode === 'multiplication') {
      setQuestion(generateMultiplicationQuestion());
      setTimeLeft(10);
      setIsTimeUp(false);
    } else if (mode === 'elometria') {
      setQuestion(generateGeometryQuestion());
    } else if (mode === 'elthematics') {
      setQuestion(generateMathQuestion());
    }
  };

  const checkAnswer = () => {
    if (!userInput.trim()) return;

    const parsedInput = parseInt(userInput, 10);

    if (parsedInput === question.correctInput) {
      // სწორი პასუხი!
      const randomPhrase = successPhrases[Math.floor(Math.random() * successPhrases.length)];
      setMessage(randomPhrase);
      setIsError(false);
      setIsCorrectAnswered(true);
      
      setCompletedQuestions(prev => prev + 1);
      if (!mistakeOnCurrent) {
        setCorrectFirstTry(prev => prev + 1);
      }
      
      setBatchCount(prev => prev + 1);
      setStreak(prev => !mistakeOnCurrent ? prev + 1 : 0);
    } else {
      // არასწორი პასუხი
      setMessage(getFailurePhrase(userInput));
      setIsError(true);
      setUserInput('');
      
      if (!mistakeOnCurrent) {
        setMistakeOnCurrent(true);
        setBatchMistakes(prev => prev + 1);
        setStreak(0); // სტრიკი ნულდება
      }
      
      // ვაბრუნებთ ფოკუსს ინფუთზე
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleNextQuestion = () => {
    setIsCorrectAnswered(false);
    
    if (streak > 0 && streak % 9 === 0) {
      triggerConfetti();
      if (Math.random() < 0.5) {
        setReward({ type: 'gif', media: getRandomGif() });
      } else {
        setReward({ type: 'emperor' });
        setEmperorDecision(null);
      }
      setBatchCount(0);
      setBatchMistakes(0);
    } else if (batchCount === 3) {
      if (batchMistakes === 0 && !mistakeOnCurrent) {
        triggerConfetti();
        setReward({ type: 'good', media: getRandomGoodImage() });
      } else {
        setReward({ type: 'bad', media: getRandomBadImage() });
      }
      setBatchCount(0);
      setBatchMistakes(0);
    } else {
      generateNextQuestion();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCorrectAnswered) {
      handleNextQuestion();
    } else {
      checkAnswer();
    }
  };

  const generateNextQuestion = () => {
    if (gameMode === 'multiplication') {
      setQuestion(generateMultiplicationQuestion());
      setTimeLeft(10);
      setIsTimeUp(false);
    } else if (gameMode === 'elometria') {
      setQuestion(generateGeometryQuestion());
    } else {
      setQuestion(generateMathQuestion());
    }
    setUserInput('');
    setMessage('');
    setIsError(false);
    setMistakeOnCurrent(false);
    setIsCorrectAnswered(false);
  };

  const handleNextAfterReward = () => {
    setReward(null);
    setEmperorDecision(null);
    generateNextQuestion();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#c084fc', '#fbbf24', '#38bdf8']
    });
  };

  const getOperatorSymbol = (op: string) => {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  };

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 bg-gradient-to-b from-fuchsia-50 to-purple-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col items-center"
        >
          <div className="mb-12 text-center">
            <h1 className="text-5xl sm:text-6xl font-black text-fuchsia-600 flex items-center justify-center gap-3 drop-shadow-sm mb-4">
              <Sparkles className="text-yellow-400 w-10 h-10" />
              ელთემატიკა
              <Sparkles className="text-yellow-400 w-10 h-10" />
            </h1>
            <p className="text-xl text-fuchsia-800 font-medium">აირჩიე თამაში</p>
          </div>

          <div className="flex flex-col gap-5 w-full">
            <button 
              onClick={() => startGame('elthematics')} 
              className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-2xl font-bold py-6 px-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              ✨ ელთემატიკა
            </button>
            <button 
              onClick={() => startGame('multiplication')} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold py-6 px-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              ✖️ ელმრავლების ტაბულა
            </button>
            <button 
              onClick={() => startGame('elometria')} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl font-bold py-6 px-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              📐 ელომეტრია
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 relative">
      <button 
        onClick={handleBackToMenu} 
        className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 bg-white rounded-full shadow-md text-fuchsia-600 hover:bg-fuchsia-50 transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 sm:mb-8 mt-12 sm:mt-0"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-fuchsia-600 flex items-center justify-center gap-2 sm:gap-3 drop-shadow-sm">
          <Sparkles className="text-yellow-400 w-8 h-8 sm:w-10 sm:h-10" />
          {gameMode === 'multiplication' ? 'ელმრავლების ტაბულა' : gameMode === 'elometria' ? 'ელომეტრია' : 'ელთემატიკა'}
          <Sparkles className="text-yellow-400 w-8 h-8 sm:w-10 sm:h-10" />
        </h1>
      </motion.div>

      {/* Stats */}
      <div className="w-full max-w-lg mb-6 sm:mb-8 bg-white rounded-2xl p-4 sm:p-5 shadow-lg border-4 border-fuchsia-100 flex justify-center items-center">
        <span className="text-fuchsia-800 font-bold text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
          <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 sm:w-8 sm:h-8" />
          სწორი: <span className="text-fuchsia-600">{correctFirstTry}</span> / სულ: <span className="text-fuchsia-600">{completedQuestions}</span>
        </span>
      </div>

      {/* Main Card */}
      <motion.div 
        className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border-4 border-fuchsia-100 w-full max-w-lg relative overflow-hidden"
        animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {reward ? (
            <motion.div 
              key="reward"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center text-center w-full"
            >
              {reward.type === 'emperor' ? (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-fuchsia-600 mb-4 sm:mb-6">
                    {!emperorDecision 
                      ? "იმპერატორო ელენე, მოვკლათ გლადიატორი ლექსო თუ იცოცხლოს?"
                      : emperorDecision === 'alive'
                        ? "დიდი მადლობა ქალბატონო იმპერატორო"
                        : "ეეეეხ ცხონებული"}
                  </h2>
                  <div className="rounded-2xl overflow-hidden border-4 border-fuchsia-200 shadow-lg mb-6 sm:mb-8 w-full h-[50vh] sm:h-[60vh] max-h-[600px] flex items-center justify-center bg-fuchsia-50">
                    <img 
                      src={!emperorDecision ? "emperor.png" : emperorDecision === 'alive' ? "alive.png" : "dead.png"} 
                      alt="Emperor" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {!emperorDecision ? (
                    <div className="flex gap-4 w-full justify-center">
                      <button
                        onClick={() => setEmperorDecision('alive')}
                        className="bg-green-500 text-white text-lg sm:text-xl font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                      >
                        👍 იცოცხლოს
                      </button>
                      <button
                        onClick={() => setEmperorDecision('dead')}
                        className="bg-red-500 text-white text-lg sm:text-xl font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                      >
                        👎 მოკალით
                      </button>
                    </div>
                  ) : (
                    <button
                      autoFocus
                      onClick={handleNextAfterReward}
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xl sm:text-2xl font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                    >
                      გაგრძელება <ArrowRight className="w-6 h-6 sm:w-8 h-8" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-fuchsia-600 mb-4 sm:mb-6">
                    {reward.media?.caption}
                  </h2>
                  
                  <div className="rounded-2xl overflow-hidden border-4 border-fuchsia-200 shadow-lg mb-6 sm:mb-8 w-full h-[50vh] sm:h-[60vh] max-h-[600px] flex items-center justify-center bg-fuchsia-50">
                    <img 
                      src={reward.media?.url} 
                      alt="Reward" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <button
                    autoFocus
                    onClick={handleNextAfterReward}
                    className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xl sm:text-2xl font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                  >
                    გაგრძელება <ArrowRight className="w-6 h-6 sm:w-8 h-8" />
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="question"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              {gameMode === 'multiplication' && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-500 flex items-center gap-2">
                      <Clock className="w-5 h-5" /> დრო
                    </span>
                    <span className={`font-black text-xl ${timeLeft <= 3 ? 'text-red-500' : 'text-blue-500'}`}>
                      {timeLeft} წამი
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className={`h-full ${timeLeft <= 3 ? 'bg-red-500' : 'bg-blue-500'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / 10) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {question.isGeometry && question.geometryData ? (
                <GeometryView data={question.geometryData} />
              ) : (
                <div className="text-center mb-6 sm:mb-8">
                  <div className="text-5xl sm:text-7xl font-black text-slate-800 tracking-wider flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
                    {question.expression.map((item, idx) => (
                      <React.Fragment key={idx}>
                        {item.op && <span className="text-fuchsia-500">{getOperatorSymbol(item.op)}</span>}
                        {question.missingIndex === idx ? (
                          <span className="text-fuchsia-600">X</span>
                        ) : (
                          <span>{item.num}</span>
                        )}
                      </React.Fragment>
                    ))}
                    <span className="text-fuchsia-500">=</span>
                    {question.missingIndex === -1 ? <span>?</span> : <span>{question.ans}</span>}
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit} className="flex flex-col items-center gap-4 sm:gap-6">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={question.missingIndex === -1 ? "პასუხი..." : "X = ..."}
                  readOnly={isCorrectAnswered}
                  className={`w-full text-center text-4xl sm:text-5xl font-bold py-4 sm:py-6 rounded-2xl border-4 focus:outline-none transition-colors ${
                    isCorrectAnswered 
                      ? 'border-green-400 bg-green-50 text-green-700' 
                      : isError 
                        ? 'border-red-400 bg-red-50 text-red-600' 
                        : 'border-fuchsia-200 focus:border-fuchsia-500 bg-fuchsia-50/50 text-fuchsia-900'
                  }`}
                  autoFocus
                />
                
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-xl sm:text-2xl font-bold text-center ${isError ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isCorrectAnswered ? (
                  <button
                    type="submit"
                    autoFocus
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl sm:text-3xl font-bold py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3"
                  >
                    შემდეგ <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-2xl sm:text-3xl font-bold py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3"
                  >
                    შემოწმება
                  </button>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
