const { Configuration, OpenAIApi } = require("openai");

export default async function handler(req, res) {
  try {
    const { CHATGPT } = process.env;

    const configuration = new Configuration({
      apiKey: CHATGPT,
    });
    const openai = new OpenAIApi(configuration);

    const { prompt } = req.body;
    const question = [
      {
        role: "system",
        content:
          "You help classify prompts into the following categories: order food, reserve library room, generate presentation, add list to task planner, upcoming events, or none ",
      },
      {
        role: "user",
        content: `Classify the following prompt: ${prompt}`,
      },
    ];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: question,
    });

    const result = response.data.choices[0].message.content;
    console.log(result);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error.response);
    return res
      .status(409)
      .send("An error occured while trying to answer this question");
  }
}
