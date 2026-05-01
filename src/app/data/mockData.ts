export interface Expert {
  name: string;
  title: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  durationSec?: number;
  muscleGroups: string[];
  isStrength: boolean;
  category: 'strength' | 'cardio' | 'stretching';
  expert: Expert & { tip: string };
  steps: string[];
  commonMistakes: string[];
  youtubeId?: string;
}

export interface Workout {
  id: string;
  name: string;
  duration: number;
  calories: number;
  category: 'strength' | 'cardio' | 'stretching';
  level: 'beginner' | 'intermediate' | 'advanced';
  exerciseIds: string[];
  exerciseCount: number;
  type: 'single' | 'weekly' | 'monthly';
  description: string;
}

export interface Quote {
  text: string;
  author: string;
  title: string;
}

export const ACCENT = '#CCFF00';

export const quotes: Quote[] = [
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Arnold Schwarzenegger",
    title: "7x Mr. Olympia Champion",
  },
  {
    text: "If something stands between you and your success, move it. Never be denied.",
    author: "Dwayne 'The Rock' Johnson",
    title: "Actor & Fitness Icon",
  },
  {
    text: "Nobody who ever gave his best regretted it.",
    author: "George Halas",
    title: "NFL Hall of Fame Coach",
  },
  {
    text: "Pain is temporary. Quitting lasts forever.",
    author: "Lance Armstrong",
    title: "7x Tour de France Winner",
  },
  {
    text: "You have to think it before you can do it. The mind is what makes it all possible.",
    author: "Kai Greene",
    title: "3x Arnold Classic Champion",
  },
  {
    text: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weight.",
    author: "Ronnie Coleman",
    title: "8x Mr. Olympia Champion",
  },
  {
    text: "Champions aren't made in the gyms. Champions are made from something they have deep inside them.",
    author: "Muhammad Ali",
    title: "3x World Heavyweight Boxing Champion",
  },
];

export const exercises: Exercise[] = [
  {
    id: "e1",
    name: "Barbell Bench Press",
    sets: 4,
    reps: 10,
    muscleGroups: ["Chest", "Triceps", "Front Deltoids"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Arnold Schwarzenegger",
      title: "7x Mr. Olympia Champion",
      tip: "Focus on the mind-muscle connection. Feel your chest stretch at the bottom and powerfully squeeze at the top. Lower the bar slowly to maximize time under tension.",
    },
    steps: [
      "Lie flat on the bench with feet firmly on the floor.",
      "Grip the bar slightly wider than shoulder-width with an overhand grip.",
      "Unrack the bar, holding it directly above your chest.",
      "Slowly lower the bar to your mid-chest, keeping elbows at a 45° angle.",
      "Press the bar back up explosively, exhaling at the top of the movement.",
      "Fully extend your arms without locking out your elbows.",
    ],
    commonMistakes: [
      "Bouncing the bar off the chest",
      "Flaring the elbows at 90°",
      "Lifting the feet off the floor",
      "Incomplete range of motion",
      "Using too much weight with bad form",
    ],
    youtubeId: "rT7DgCr-3pg",
  },
  {
    id: "e2",
    name: "Barbell Back Squat",
    sets: 4,
    reps: 8,
    muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Core"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Ronnie Coleman",
      title: "8x Mr. Olympia Champion",
      tip: "Drive through your heels and keep your chest up. The squat is a full-body movement — brace your core like you're about to take a punch. Yeah buddy!",
    },
    steps: [
      "Position the bar on your upper traps, feet shoulder-width apart.",
      "Take a deep breath and brace your core before descending.",
      "Push your hips back and bend your knees, keeping them tracking over your toes.",
      "Descend until your thighs are parallel to the floor or below.",
      "Drive through your heels to stand back up.",
      "Exhale at the top of the movement.",
    ],
    commonMistakes: [
      "Knees caving inward (valgus collapse)",
      "Heels rising off the floor",
      "Rounding the lower back",
      "Not reaching parallel depth",
      "Looking down instead of forward/up",
    ],
    youtubeId: "bEv6CCg2BC8",
  },
  {
    id: "e3",
    name: "Conventional Deadlift",
    sets: 3,
    reps: 6,
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back", "Traps", "Core"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Hafthor Bjornsson",
      title: "World's Strongest Man 2018",
      tip: "The deadlift is about tension. Before you pull, create maximum tension throughout your whole body — tight lats, braced core, neutral spine. The bar should feel like it's bolted to the floor.",
    },
    steps: [
      "Stand with feet hip-width apart, bar over mid-foot.",
      "Hinge at the hips, grip the bar just outside your legs.",
      "Lower your hips until your shins touch the bar.",
      "Take a big breath, brace your core, and pull the slack out of the bar.",
      "Drive the floor away as you extend hips and knees simultaneously.",
      "Lock out at the top with hips fully extended, then lower under control.",
    ],
    commonMistakes: [
      "Rounding the lower back",
      "Bar drifting away from the body",
      "Using leg drive only (squat-style pull)",
      "Jerking the bar off the floor",
      "Hyperextending the lower back at lockout",
    ],
    youtubeId: "op9kVnSso6Q",
  },
  {
    id: "e4",
    name: "Pull-Up",
    sets: 3,
    reps: 8,
    muscleGroups: ["Lats", "Biceps", "Rear Deltoids", "Core"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Chris Bumstead",
      title: "5x Classic Physique Mr. Olympia",
      tip: "Think about pulling your elbows down into your pockets rather than pulling yourself up. This cue activates the lats much more effectively and gives you that wide, tapered back.",
    },
    steps: [
      "Hang from the bar with hands slightly wider than shoulder-width.",
      "Engage your core and pull your shoulder blades together and down.",
      "Drive your elbows toward the floor as you pull yourself up.",
      "Chin should clear the bar at the top.",
      "Lower yourself in a controlled 2-3 second negative.",
      "Fully extend at the bottom before the next rep.",
    ],
    commonMistakes: [
      "Using momentum to swing up",
      "Not achieving full range of motion",
      "Shrugging the shoulders at the top",
      "Looking straight down instead of forward-up",
      "Crossing ankles creating swing",
    ],
    youtubeId: "eGo4IYlbE5g",
  },
  {
    id: "e5",
    name: "Overhead Press",
    sets: 4,
    reps: 10,
    muscleGroups: ["Front Deltoids", "Lateral Deltoids", "Triceps", "Upper Traps"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Arnold Schwarzenegger",
      title: "7x Mr. Olympia Champion",
      tip: "The Arnold Press is my favorite for complete shoulder development. Rotate through the full range and feel each head of the deltoid working. Build those cannonball shoulders!",
    },
    steps: [
      "Stand with feet shoulder-width apart, bar racked at shoulder height.",
      "Grip the bar just outside shoulder-width with palms facing forward.",
      "Brace your core and glutes before pressing.",
      "Press the bar directly overhead, locking out at the top.",
      "Tuck chin slightly so the bar can pass your face safely.",
      "Lower under control back to the start position.",
    ],
    commonMistakes: [
      "Excessive lower back arch",
      "Bar path too far forward",
      "Pressing behind the neck (injury risk)",
      "Not fully locking out at the top",
      "Flaring elbows excessively outward",
    ],
    youtubeId: "2yjwXTZQDDI",
  },
  {
    id: "e6",
    name: "Dumbbell Bicep Curl",
    sets: 3,
    reps: 12,
    muscleGroups: ["Biceps", "Brachialis", "Forearms"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Ronnie Coleman",
      title: "8x Mr. Olympia Champion",
      tip: "Supinate your wrist at the top to fully contract the bicep. Control the negative — the eccentric phase builds more muscle than the concentric. Lightweight baby!",
    },
    steps: [
      "Stand holding dumbbells with arms fully extended, palms facing forward.",
      "Keep your elbows pinned to your sides throughout the movement.",
      "Curl the weights up while rotating your wrists outward (supination).",
      "Squeeze the biceps hard at the top of the movement.",
      "Lower the weights slowly over 2-3 seconds.",
      "Fully extend at the bottom before the next rep.",
    ],
    commonMistakes: [
      "Swinging the torso for momentum",
      "Elbows drifting forward",
      "Not fully extending at the bottom",
      "Rushing the negative phase",
      "Not supinating the wrist at the top",
    ],
    youtubeId: "ykJmrZ5v0Oo",
  },
  {
    id: "e7",
    name: "Burpee",
    sets: 3,
    reps: 15,
    muscleGroups: ["Full Body", "Core", "Shoulders", "Legs"],
    isStrength: false,
    category: "cardio",
    expert: {
      name: "Rich Froning",
      title: "4x CrossFit Games Champion",
      tip: "Consistency is everything with burpees. Find a pace you can maintain for all reps. It's better to go steady the whole set than sprint and collapse. Breathe out on the jump.",
    },
    steps: [
      "Stand with feet shoulder-width apart.",
      "Drop into a squat and place hands on the floor.",
      "Jump feet back into a high plank position.",
      "Perform a push-up (optional for beginners).",
      "Jump feet forward to your hands.",
      "Explosively jump up with arms overhead.",
    ],
    commonMistakes: [
      "Sagging hips in the plank position",
      "Landing hard on the joints",
      "Not fully extending on the jump",
      "Going too fast and losing form",
      "Forgetting to breathe rhythmically",
    ],
    youtubeId: "dZgVxmf6jkA",
  },
  {
    id: "e8",
    name: "Mountain Climbers",
    sets: 3,
    durationSec: 45,
    muscleGroups: ["Core", "Hip Flexors", "Shoulders", "Cardiovascular System"],
    isStrength: false,
    category: "cardio",
    expert: {
      name: "Rich Froning",
      title: "4x CrossFit Games Champion",
      tip: "Keep your hips level — don't let them pike up. The faster you go, the more your core has to fight for stability. This is where the cardio and core work intersect.",
    },
    steps: [
      "Start in a high plank with hands directly under shoulders.",
      "Keep your core tight and hips level.",
      "Drive one knee toward your chest.",
      "Quickly switch legs in a running motion.",
      "Keep alternating as fast as possible while maintaining form.",
      "Breathe continuously throughout.",
    ],
    commonMistakes: [
      "Piking the hips up too high",
      "Bouncing the body up and down",
      "Looking down at the floor (neck strain)",
      "Losing core engagement at speed",
      "Arms drifting too far forward",
    ],
    youtubeId: "nmwgirgXLYM",
  },
  {
    id: "e9",
    name: "Jumping Jacks",
    sets: 3,
    durationSec: 60,
    muscleGroups: ["Cardiovascular System", "Calves", "Deltoids", "Legs"],
    isStrength: false,
    category: "cardio",
    expert: {
      name: "Usain Bolt",
      title: "World Record Holder, 100m Sprint",
      tip: "Even simple movements done with intention build fitness. Keep your arms fully extended and land softly on the balls of your feet to protect your joints.",
    },
    steps: [
      "Stand upright with feet together and arms at your sides.",
      "Jump while simultaneously spreading your feet wide.",
      "Raise your arms overhead as your feet spread.",
      "Jump again, bringing feet back together.",
      "Lower arms back to your sides as feet meet.",
      "Repeat in a continuous, rhythmic motion.",
    ],
    commonMistakes: [
      "Landing on heels (joint stress)",
      "Arms not fully extending overhead",
      "Uneven foot spread",
      "Going too fast without rhythm",
      "Tensing the shoulders unnecessarily",
    ],
    youtubeId: "c4DAnQ6DtF8",
  },
  {
    id: "e10",
    name: "Plank",
    sets: 3,
    durationSec: 60,
    muscleGroups: ["Core", "Transverse Abdominis", "Shoulders", "Glutes"],
    isStrength: false,
    category: "stretching",
    expert: {
      name: "Simone Biles",
      title: "Olympic Gymnastics Champion",
      tip: "The plank is not about time — it's about quality. Every second, actively squeeze your glutes, brace your abs, and push the floor away. A perfect 30-second plank beats a sloppy 2-minute one.",
    },
    steps: [
      "Place forearms on the floor, elbows directly under shoulders.",
      "Extend legs behind you, feet together.",
      "Create a straight line from head to heels.",
      "Squeeze your core, glutes, and thighs simultaneously.",
      "Look at the floor slightly ahead of your hands.",
      "Hold for the prescribed time without letting your hips sag or pike.",
    ],
    commonMistakes: [
      "Hips sagging toward the floor",
      "Hips piking too high",
      "Holding your breath",
      "Shoulders too far forward of elbows",
      "Neck straining upward or downward",
    ],
    youtubeId: "TvxS_kB1SEU",
  },
  {
    id: "e11",
    name: "Hip Flexor Stretch",
    sets: 2,
    durationSec: 45,
    muscleGroups: ["Hip Flexors", "Quadriceps", "Psoas"],
    isStrength: false,
    category: "stretching",
    expert: {
      name: "Simone Biles",
      title: "Olympic Gymnastics Champion",
      tip: "For the best hip flexor stretch, tuck your pelvis under — this is the key that most people miss. Without the posterior pelvic tilt, you're not truly lengthening the hip flexor.",
    },
    steps: [
      "Start in a high kneeling position on one knee.",
      "Bring your front foot forward so your front knee is at 90°.",
      "Tuck your pelvis under (posterior tilt) to flatten your lower back.",
      "Shift your weight forward gently until you feel a stretch in the front hip.",
      "Hold the position, breathing deeply.",
      "Switch sides after the prescribed time.",
    ],
    commonMistakes: [
      "Not tucking the pelvis (missing the key stretch)",
      "Front knee extending past the toes",
      "Arching the lower back excessively",
      "Holding breath instead of breathing deeply",
      "Rushing the stretch rather than holding",
    ],
    youtubeId: "YQmpO3YoKP8",
  },
  {
    id: "e12",
    name: "Romanian Deadlift",
    sets: 3,
    reps: 12,
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Hafthor Bjornsson",
      title: "World's Strongest Man 2018",
      tip: "Feel the hamstrings loading as you hinge. Push your hips back as far as possible — the goal is a deep hamstring stretch before you drive through. The weight follows the movement, not the other way around.",
    },
    steps: [
      "Hold dumbbells or barbell in front of thighs, feet hip-width apart.",
      "Hinge at the hips, pushing them backward while keeping back straight.",
      "Lower the weight along your legs, keeping it close to your body.",
      "Feel a deep stretch in your hamstrings at the bottom.",
      "Drive your hips forward to return to the standing position.",
      "Squeeze glutes at the top.",
    ],
    commonMistakes: [
      "Rounding the lower back",
      "Bar drifting away from the legs",
      "Bending the knees too much (turning it into a squat)",
      "Not achieving a sufficient hip hinge angle",
      "Rushing through the movement",
    ],
    youtubeId: "2SHsk9AzdjA",
  },
  {
    id: "e13",
    name: "Leg Press",
    sets: 4,
    reps: 12,
    muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Ronnie Coleman",
      title: "8x Mr. Olympia Champion",
      tip: "Place your feet high on the platform to emphasize glutes and hamstrings. Lower on the platform hits more quads. Never lock out your knees at the top — keep constant tension on the muscles.",
    },
    steps: [
      "Sit in the machine, back flat against the pad.",
      "Place feet shoulder-width apart on the platform.",
      "Release the safety handles and lower the platform toward your chest.",
      "Stop when knees are at 90° or slightly below.",
      "Press the platform away, stopping short of full knee lockout.",
      "Control the weight back down for the next rep.",
    ],
    commonMistakes: [
      "Fully locking out knees at the top",
      "Lifting lower back off the pad",
      "Knees caving inward during the press",
      "Feet too close together",
      "Partial range of motion only",
    ],
    youtubeId: "IZxyjW7MPJQ",
  },
  {
    id: "e14",
    name: "Tricep Dips",
    sets: 3,
    reps: 12,
    muscleGroups: ["Triceps", "Chest", "Front Deltoids"],
    isStrength: true,
    category: "strength",
    expert: {
      name: "Chris Bumstead",
      title: "5x Classic Physique Mr. Olympia",
      tip: "To really isolate the triceps, keep your body as upright as possible throughout the movement. Leaning forward shifts emphasis to the chest. Either is valid — just know your goal.",
    },
    steps: [
      "Grip parallel bars and extend arms, lifting body off the floor.",
      "Keep torso upright for tricep focus, or lean forward for chest focus.",
      "Bend elbows and lower your body in a controlled manner.",
      "Descend until upper arms are parallel to the floor.",
      "Press yourself back up to the starting position.",
      "Fully extend arms at the top without locking out.",
    ],
    commonMistakes: [
      "Going too deep (shoulder impingement risk)",
      "Flaring elbows out wide",
      "Using momentum to bounce up",
      "Shrugging shoulders toward ears",
      "Inconsistent torso angle",
    ],
    youtubeId: "6kALZikXxLc",
  },
  {
    id: "e15",
    name: "Box Jump",
    sets: 4,
    reps: 8,
    muscleGroups: ["Glutes", "Quadriceps", "Calves", "Cardiovascular System"],
    isStrength: false,
    category: "cardio",
    expert: {
      name: "Rich Froning",
      title: "4x CrossFit Games Champion",
      tip: "Load your hips and arms before the jump — the arm swing generates up to 30% of your jump power. Land softly in a quarter squat to absorb force safely. Step down, never jump down.",
    },
    steps: [
      "Stand in front of the box, feet shoulder-width apart.",
      "Hinge hips slightly and swing arms back to load for the jump.",
      "Explosively jump forward and up, swinging arms forward.",
      "Bring your knees up as you rise.",
      "Land softly on both feet in a quarter squat position.",
      "Stand fully before stepping down one foot at a time.",
    ],
    commonMistakes: [
      "Landing with straight legs",
      "Jumping down instead of stepping down",
      "Using too high a box before mastering lower ones",
      "Not loading the hips before jumping",
      "Landing with feet too narrow",
    ],
    youtubeId: "NBY9-kTuHEk",
  },
];

export const workouts: Workout[] = [
  {
    id: "w1",
    name: "Upper Body Power",
    duration: 45,
    calories: 320,
    category: "strength",
    level: "intermediate",
    exerciseIds: ["e1", "e4", "e5", "e6", "e14"],
    exerciseCount: 5,
    type: "single",
    description: "A complete upper body workout targeting chest, back, and shoulders.",
  },
  {
    id: "w2",
    name: "Lower Body Builder",
    duration: 50,
    calories: 380,
    category: "strength",
    level: "intermediate",
    exerciseIds: ["e2", "e3", "e12", "e13"],
    exerciseCount: 4,
    type: "single",
    description: "Build massive legs with this heavy compound movement workout.",
  },
  {
    id: "w3",
    name: "Full Body Burn",
    duration: 35,
    calories: 450,
    category: "cardio",
    level: "beginner",
    exerciseIds: ["e7", "e8", "e9", "e15"],
    exerciseCount: 4,
    type: "single",
    description: "High-intensity full body cardio to maximize calorie burn.",
  },
  {
    id: "w4",
    name: "Recovery & Stretch",
    duration: 25,
    calories: 120,
    category: "stretching",
    level: "beginner",
    exerciseIds: ["e10", "e11"],
    exerciseCount: 2,
    type: "single",
    description: "Active recovery session to improve flexibility and reduce soreness.",
  },
  {
    id: "w5",
    name: "Push Day",
    duration: 55,
    calories: 350,
    category: "strength",
    level: "advanced",
    exerciseIds: ["e1", "e5", "e14", "e6"],
    exerciseCount: 4,
    type: "single",
    description: "Advanced pressing movements for chest, shoulders, and triceps.",
  },
  {
    id: "w6",
    name: "Pull Day",
    duration: 50,
    calories: 330,
    category: "strength",
    level: "advanced",
    exerciseIds: ["e3", "e4", "e12"],
    exerciseCount: 3,
    type: "single",
    description: "Heavy pulling movements to build a wide, powerful back.",
  },
  {
    id: "w7",
    name: "Beginner Full Body",
    duration: 30,
    calories: 200,
    category: "strength",
    level: "beginner",
    exerciseIds: ["e2", "e1", "e10"],
    exerciseCount: 3,
    type: "single",
    description: "Perfect starting point with fundamental movements at lower intensity.",
  },
  {
    id: "w8",
    name: "4-Week Strength Program",
    duration: 50,
    calories: 360,
    category: "strength",
    level: "intermediate",
    exerciseIds: ["e1", "e2", "e3", "e4", "e5"],
    exerciseCount: 5,
    type: "monthly",
    description: "Progressive 4-week program to build overall strength and muscle.",
  },
  {
    id: "w9",
    name: "7-Day Body Recomp",
    duration: 40,
    calories: 300,
    category: "cardio",
    level: "intermediate",
    exerciseIds: ["e7", "e8", "e15", "e9"],
    exerciseCount: 4,
    type: "weekly",
    description: "A full week of varied training designed for fat loss and muscle retention.",
  },
  {
    id: "w10",
    name: "HIIT Cardio Blast",
    duration: 20,
    calories: 280,
    category: "cardio",
    level: "advanced",
    exerciseIds: ["e7", "e8", "e15", "e9"],
    exerciseCount: 4,
    type: "single",
    description: "Short but brutally effective high-intensity interval training.",
  },
];

export const recommendedWorkouts = [
  { workoutId: "w3", reason: "Great for active recovery days" },
  { workoutId: "w7", reason: "Recommended for your fitness level" },
  { workoutId: "w4", reason: "Improve flexibility & reduce soreness" },
];

export const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];