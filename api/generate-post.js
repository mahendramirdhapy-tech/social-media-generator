// api/generate-post.js (TEMPORARY - No API Keys Needed)
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { topic, platform = 'instagram', tone = 'inspirational', instructions = '' } = req.body;

        if (!topic || topic.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Topic is required' 
            });
        }

        console.log('🔄 Generating post for:', topic);

        // SIMPLE MOCK RESPONSE - No API keys needed
        const mockImageUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
        
        const mockCaption = `🚀 AI-Generated Post About: ${topic}

🌟 This is a demo post created by our AI Social Media Generator!

💡 Platform: ${platform}
🎨 Tone: ${tone}
📝 Instructions: ${instructions || 'None'}

✨ Like and share if you find this helpful!
🔔 Follow for more amazing content!

#${topic.replace(/\s+/g, '')} #AIGenerated #SocialMedia #${platform} #Demo`;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.status(200).json({
            success: true,
            imageUrl: mockImageUrl,
            caption: mockCaption,
            platform,
            tone,
            timestamp: new Date().toISOString(),
            note: "Demo mode - Add API keys for real AI generation"
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
}
