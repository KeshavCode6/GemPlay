import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDkzJl2M3CorRI35eKDcZkIJ3X-1PkGTJc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const characters = ["archer", "soldier"];
const backdrops = ["lake", "castle", "cave", "village", "village2", "desert"];
const actionTypes = ["speak", "leave", "move", "attack", "die"];
const music = ["calm1", "battle1", "battle2", "calm2"];

export interface Scene {
  characters: { character: string, position: string, direction: string }[],
  backdrop: string,
  msuic: string,
  actions: { character: string, actionType: "move" | "leave" | "speak", target: string }[]
}

export function isValidScene(scene: Scene) {
  if (typeof scene !== 'object' || scene === null) return false;

  if (!Array.isArray(scene.characters) || !scene.characters.every(c =>
    typeof c.character === 'string' && characters.includes(c.character) &&
    typeof c.position === 'number')) return false;

  if (typeof scene.backdrop !== 'string' || !backdrops.includes(scene.backdrop)) return false;

  if (typeof scene.msuic !== 'string' || !music.includes(scene.msuic)) return false;

  if (!Array.isArray(scene.actions) || !scene.actions.every(a =>
    typeof a.character === 'string' && characters.includes(a.character) &&
    typeof a.actionType === 'string' && actionTypes.includes(a.actionType) &&
    typeof a.target === 'string')) return false;

  return true;
}


export async function askQuestion(question: string): Promise<string> {
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

  const response = await model.generateContent(prompt);
  return response.response.text();
}

export async function createStoryPath() {

  const prompt = `
    Generate a structured JSON story path with three choices at each level, maintaining a nested hierarchy.
    The JSON format must strictly follow this structure:

      - Each topic must involve **at least two** of the provided characters: ${characters}.  
      - Each topic must take place within the given backdrops: ${backdrops}.  
      - **Only use the listed characters**—do not introduce or reference any other entities (e.g., if "dragon" is not in ${characters}, it cannot be mentioned).  
      - The story topics must be **logically feasible** within the provided backdrops.  
      - The topics must be **achievable using only the following actions**: ${actionTypes}.  
      - Generate **NEW, UNIQUE** and creative topics that do not copy the examples below. Try to not directly use the action in the topic, have it implied instead.
      - Tie each topic directly to a backdrop  
      - Make each path build off the last node to build a cohesive story in which the user can pick what happens
      - Each topic must be a sentence, not a title 
      - Vary the amount of subpaths there are, between 2-4
      - Include at least 2 root paths
      - For each topic, there can only be one of each character (i.e, no goblin army allowed)
      - The characters must always be on the same backdrop

      Topics = {
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
          }
              .....
        ]
      }

    Return Topics
  `;

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });


  console.log(response.response.text())

  return JSON.parse(response.response.text());
}

export async function createScene(curretNode: { topic: string, paths?: string[] }) {

  const prompt = `
  You are a helpful assistant. 
  Use the following characters: ${characters} as actors in the story.
  
  The scene must be about ${curretNode.topic}. Ensure that the scene makes logical sense so that
  any of the following (${curretNode.paths}) can come after it and make sense.


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
    Return: Scene
  `

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  console.log(response.response.text())
  return JSON.parse(response.response.text());
}


