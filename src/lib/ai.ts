import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDkzJl2M3CorRI35eKDcZkIJ3X-1PkGTJc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export async function askQuestion(question: string): Promise<string> {
  const prompt = `
      You are a helpful assistant for an organization called GemPlay. Here are the Frequently Asked Questions (FAQs):
  
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
    `;

  const response = await model.generateContent(prompt);
  return response.response.text();
}

export async function createStoryPath() {
  let characters = ["knight", "archer", "king", "queen", "wizard", "dragon", "elf", "dwarf", "goblin"];
  let backdrops = ["forest", "castle", "beach", "city"];
  let actionTypes = ["speak", "leave", "move", "attack", "defend", "die"];

  const prompt = `
    Generate a structured JSON story path with three choices at each level, maintaining a nested hierarchy.
    The JSON format must strictly follow this structure:

      - Each topic must involve **at least two** of the provided characters: ${characters}.  
      - Each topic must take place within the given backdrops: ${backdrops}.  
      - **Only use the listed characters**—do not introduce or reference any other entities (e.g., if "dragon" is not in ${characters}, it cannot be mentioned).  
      - The story topics must be **logically feasible** within the provided backdrops.  
      - The topics must be **achievable using only the following actions**: ${actionTypes}.  
      - Generate **NEW, UNIQUE** and creative topics that do not copy the examples below.   Try to use synonyms of ${actionTypes}
      - Tie each topic directly to a backdrop  
      - Make each path build off the last node to build a cohesive story in which the user can pick what happens
      - Each topic must be a sentence, not a title 
      - Vary the amount of subpaths there are, between 2-4

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
