const { Configuration, OpenAIApi } = require("openai");

export default async function handler(req, res) {
  try {
    const { CHATGPT } = process.env;

    const configuration = new Configuration({
      apiKey: CHATGPT,
    });
    const openai = new OpenAIApi(configuration);

    const topic = req.body.topic;

    const prompt = `Write a full and advanced presentation explaining ${topic}, consisting of different slides and advanced content within each slide. Include the definitions. Not an outline but the entire presentation itself. Include the title and content. Must include at least 7 slides. Add § after the title of each slide and after the content of each slide.`;
    console.log(prompt);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });

    const result = response.data.choices[0].text;
    return res.status(200).send(result);
  } catch (error) {
    console.log(error.data);
    return res.status(409).send(error);
  }
}
