// api/generate-post.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { topic, platform, tone, instructions } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Generate image using Hugging Face
        const imageUrl = await generateImageWithHF(topic);
        
        // Generate caption using OpenRouter
        const caption = await generateCaptionWithOR(topic, platform, tone, instructions);

        res.status(200).json({
            success: true,
            imageUrl,
            caption,
            platform,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

async function generateImageWithHF(prompt) {
    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    
    const response = await fetch(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    width: 512,
                    height: 512,
                    num_inference_steps: 25
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    
    return `data:image/png;base64,${imageBase64}`;
}

async function generateCaptionWithOR(topic, platform, tone, instructions) {
    const OR_API_KEY = process.env.OPENROUTER_API_KEY;
    
    const prompt = createCaptionPrompt(topic, platform, tone, instructions);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OR_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.SITE_URL,
            'X-Title': 'Social Media Generator'
        },
        body: JSON.stringify({
            model: 'google/gemini-flash-1.5',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function createCaptionPrompt(topic, platform, tone, instructions) {
    return `Create a ${tone} social media caption for ${platform} about "${topic}".
    
    ${instructions ? `Additional instructions: ${instructions}` : ''}
    
    Requirements:
    - Platform-appropriate length and style
    - Engaging and shareable
    - Include relevant hashtags
    - Natural and authentic tone
    - Include a call-to-action
    
    Return only the caption text without any explanations or markdown.`;
}
