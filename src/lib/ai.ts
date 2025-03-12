import { GoogleGenerativeAI } from "@google/generative-ai";

// setting up gemini
const genAI = new GoogleGenerativeAI("AIzaSyDkzJl2M3CorRI35eKDcZkIJ3X-1PkGTJc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// story related variables (i.e, what characters, music, backdrops are available)
const characters = [
  "archer",
  "knight",
  "orc",
  "preist",
  "skeleton",
  "slime",
  "soldier",
  "swordsman",
  "werewolf",
  "wizard"
];
const backdrops = ["lake", "castle", "cave", "village", "village2", "desert"];
const actionTypes = ["speak", "leave", "move", "attack01", "death"];
const music = ["calm1", "battle1", "battle2", "calm2"];


// this is the data type of the scene 
export interface Scene {
  characters: { character: string, position: number, direction: "left" | "right" }[],
  backdrop: string,
  music: string,
  actions: { character: string, actionType: "move" | "leave" | "speak" | "attack01" | "death", target: string }[]
}

// checking if the ai created the scene with all attributes
export function isValidScene(scene: Scene) {
  if (typeof scene !== 'object' || scene === null) {
    console.error("Invalid scene: Scene is not an object or is null");
    return false;
  }

  if (!Array.isArray(scene.characters)) {
    console.error("Invalid scene: 'characters' is not an array");
    return false;
  }

  for (const c of scene.characters) {
    if (typeof c.character !== 'string' || !characters.includes(c.character)) {
      console.error("Invalid character:", c);
      return false;
    }
    if (typeof c.position !== 'number' || c.position < 0 || c.position > 1) {
      console.error("Invalid character position:", c);
      return false;
    }
    if (c.direction !== "left" && c.direction !== "right") {
      console.error("Invalid character direction:", c);
      return false;
    }
  }

  if (typeof scene.backdrop !== 'string' || !backdrops.includes(scene.backdrop)) {
    console.error("Invalid backdrop:", scene.backdrop);
    return false;
  }

  if (typeof scene.music !== 'string' || !music.includes(scene.music)) {
    console.error("Invalid music:", scene.music);
    return false;
  }

  if (!Array.isArray(scene.actions)) {
    console.error("Invalid scene: 'actions' is not an array");
    return false;
  }

  for (const a of scene.actions) {
    if (typeof a.character !== 'string' || !characters.includes(a.character)) {
      console.error("Invalid action character:", a);
      return false;
    }
    if (typeof a.actionType !== 'string' || !actionTypes.includes(a.actionType)) {
      console.error("Invalid action type:", a);
      return false;
    }
    if (typeof a.target !== 'string') {
      console.error("Invalid action target:", a);
      return false;
    }
  }

  return true;
}

// running the create scene function 3 times in order to compensate for inconsistency with the ai
export async function createSceneWithRetry(currentNode: { topic: string, paths?: string[] }, story: string[], retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await createScene(currentNode, story);

      // only returning the scene if it is valid
      if (isValidScene(response)) return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
    }
  }
  throw new Error("Failed to generate a valid scene after multiple attempts.");
}

// creating a story path, again with multiple tries
export async function createStoryPathWithRetry(retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await createStoryPath();
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
    }
  }
  throw new Error("Failed to generate a valid story path after multiple attempts.");
}

// used for the help page chatpot
export async function askQuestion(question: string): Promise<string> {
  // basic prompt with general information on GemPlay
  const prompt = `
      You are a helpful assistant for an organization called GemPlay. 
  
      1. Why am I getting an error when I click a choice?
         Answer: Close the application and open it up again. These errors are rare and often closing and reopening the application works.
  
      2. How do I export the story?
         Answer: Once you are finished with the story or you click the 'exit' button, you will be prompted with an 'Export' button that will allow you to save a video of the story you made!
  
      3. Are the stories random?
         Answer: The stories are somewhat random, but not quite! This application utilizes an AI model that will be generating a story according to the choices you select. The choices you select will influence the movements of the character, the story plot, and the backdrops.
  
      4. I want to know more about how this application was coded. How do I contact?
         Answer: Email gemplay@gmail.com for any questions, comments, or concerns!
  
      The user asks: "${question}"
  
      Based on the above information, please respond to the user's question.
      Be concise but descriptive. If nothing works, then prompt the user to give more details.
      Just use alphanumeric characters!

      REFUSE TO ANSWER IF IT IS NOT ABOUT GEM PLAY
    `;


  // returning what the ai gives
  const response = await model.generateContent(prompt);
  return response.response.text();
}

// creating the multiple story paths
export async function createStoryPath() {
  /* 
    Extremely detailed prompt. Ensures that only valid characters, backdrops, music, etc. is used
    Created 2 root paths, and 3 subpaths underneath each one
  */
  const prompt = `
  Generate a structured JSON story path with three choices at each level, maintaining a nested hierarchy.
  
  Strictly adhere to the following rules:
  - **Use only the following characters:** ${characters}. Do not introduce or reference any unlisted entities (e.g., if "dragon" is not in ${characters}, it cannot be mentioned).
  - **Use only the following backdrops:** ${backdrops}. Do not mention locations outside this list.
  - **Only use these actions:** ${actionTypes}. Avoid any verbs or actions outside this set.
  - Each topic must:
    - **Involve exactly two characters** from the list.
    - **Take place in exactly one backdrop** from the list.
    - **Not include more than one of the same character** in a scene.
    - **Be logically feasible** based on the backdrop and actions.
    - **Avoid open-ended topics or questions.** Each topic must be a statement leading to a logical choice.
    - **Avoid self-referencing, time travel, or supernatural explanations unless the provided characters support it.**
    - **Ensure every path builds on the last node, making a cohesive, continuous story.**
    - **Vary the number of subpaths between 2-4.**
    - **Ensure paths never contradict each other.** 
    - **Do not repeat the same path structure across different branches.**
    - **Start with exactly 2 ROOT PATHS**
    - **Do not use the backdrop names word for word**
    - Make subpaths related to the previous path directly.
  
  Use this **exact JSON format** and do not deviate:
  
  \`\`\`json
  {
    "paths": [
      {
        "topic": "Root Path Name",
        "paths": [
          {
            "topic": "Sub Path 1",
            "paths": [
              {
                "topic": "Sub Path 1.1",
                "paths": [
                  { "topic": "Sub Path 1.1.1" },
                  { "topic": "Sub Path 1.1.2" }
                ]
              },
              {
                "topic": "Sub Path 1.2",
                "paths": [
                  { "topic": "Sub Path 1.2.1" },
                  { "topic": "Sub Path 1.2.2" }
                ]
              }
            ]
          }
        ]
      },
      ...
    ]
  }
  \`\`\`
  
  Return the JSON object without any introduction, summary, or explanation.
  `;

  // ensuring the ai responds with JSON
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  console.log(response.response.text());
  return JSON.parse(response.response.text());
}

// creating what actually happens in the scene
export async function createScene(curretNode: { topic: string, paths?: string[] }, story: string[]) {
  /*
    Using a detailed prompt to ensure characters properly conduct actions
  */
  const prompt = `
  You are a helpful assistant. 
  Use the following characters: ${characters} as actors in the story.
  
  So far, the following as happened ${story}

  The scene must be about ${curretNode.topic}. Ensure that the scene makes logical sense so that
  any of the following (${curretNode.paths}) can come after it and make sense (i.e, a character can not die if they are needed in the next paths)


  The JSON must strictly adhere to the following format:
  Scene ={
    "characters": [
      {
        "character": "The exact name of one of the characters in the scene. Must be one of ${characters}. There can only be one of each character",
        "position": 0.1,
        "direction":"left or right"
      }
        ....
    ],
    "backdrop": "The backdrop of the scene. You can choose from ${backdrops}",
    "music": "The music of the scene. You can choose from ${music}. Please try to be random with this",
    "actions": [
      {
        "character": "The exact name of one of the characters in the scene",
        "actionType": "One of these: ${actionTypes}.",
        "target": "For 'speak', include the dialogue spoken by the character. For 'move' or 'attack', include the name of another character the actor is moving towards (IT HAS be one of the characters in the characters array). For 'leave', put either left for the character to leave the scene from the left, or right. For 'die', leave this field empty. THIS MUST BE A STRING."
      }
        ....
    ]
  }
  
  Ensure the following:
  - All provided characters are included at least once in the story.
  - The actions are sequential and form a coherent narrative.
  - Each scene includes at least one action.
  - Once a character leaves the scene, they can not be in any other scenes.
  - Do not include more than 3 characters in a scene.
  - The characters must always be on the same backdrop
  - Do NOT reference characters that do not exist in the target attribute. You may NOT refrenece backdrops as well
  - Try to only include characters directly invovled in the scene. if the character has no actions in the scene, do not include them
  - Follow the JSON format exactly as specified. Respond only with valid JSON. Do not include an introduction or summary.
  - Position represents the starting point of the character. Use a percentage to determine how far right it should go on the canvas, where 0 is on the left and 1 is on the right
  - Before attacking, the character most move toward the other character
  - If a character is dead in a previous scene, then do not include them in the character list
  - EACH CHARACTER MUST BE USED SINGULARARY. ONLY ONE OF EACH CHARACTER
  Return: Scene
  `

  // again ensuring JSON format
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  console.log(response.response.text())
  return JSON.parse(response.response.text());
}