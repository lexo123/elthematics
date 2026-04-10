/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRandomGoodImage, getRandomBadImage, getRandomGif, MediaItem } from './data/media';

// მათემატიკური კითხვის გენერატორი (9 წლის ბავშვისთვის, 100-ის ფარგლებში)
const generateMathQuestion = () => {
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

export default function App() {
  const [question, setQuestion] = useState(generateMathQuestion());
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // თამაშის სტატისტიკა
  const [completedQuestions, setCompletedQuestions] = useState(0); // სულ რამდენი კითხვა გაიარა
  const [correctFirstTry, setCorrectFirstTry] = useState(0); // რამდენი გამოიცნო პირველივე ცდაზე
  const [streak, setStreak] = useState(0); // ზედიზედ სწორი პასუხები (გიფისთვის)
  const [batchCount, setBatchCount] = useState(0); // მიმდინარე 3 კითხვიანი ციკლი (სურათისთვის)
  const [batchMistakes, setBatchMistakes] = useState(0); // შეცდომები მიმდინარე 3 კითხვიან ციკლში
  const [mistakeOnCurrent, setMistakeOnCurrent] = useState(false); // დაუშვა თუ არა შეცდომა მიმდინარე კითხვაზე
  const [isCorrectAnswered, setIsCorrectAnswered] = useState(false); // სწორად უპასუხა და ელოდება შემდეგზე გადასვლას

  // ჯილდოს სტეიტი
  const [reward, setReward] = useState<{ type: 'good' | 'bad' | 'gif' | 'emperor', media?: MediaItem } | null>(null);
  const [emperorDecision, setEmperorDecision] = useState<'alive' | 'dead' | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!reward && !isCorrectAnswered) {
      inputRef.current?.focus();
    }
  }, [reward, question, isCorrectAnswered]);

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
    setQuestion(generateMathQuestion());
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

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-fuchsia-600 flex items-center justify-center gap-2 sm:gap-3 drop-shadow-sm">
          <Sparkles className="text-yellow-400 w-8 h-8 sm:w-10 sm:h-10" />
          ელთემატიკა
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
                  <div className="rounded-2xl overflow-hidden border-4 border-fuchsia-200 shadow-lg mb-6 sm:mb-8 w-full aspect-square max-h-64 sm:max-h-80 flex items-center justify-center bg-fuchsia-50">
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
                  
                  <div className="rounded-2xl overflow-hidden border-4 border-fuchsia-200 shadow-lg mb-6 sm:mb-8 w-full aspect-square max-h-64 sm:max-h-80 flex items-center justify-center bg-fuchsia-50">
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

