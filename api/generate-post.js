// api/generate-post.js - FIXED VERSION
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

        console.log('🔄 Generating post for:', { topic, platform, tone });

        // Generate image with better prompts
        const imageUrl = await generateSocialMediaImage(topic, platform);
        
        // Generate caption with better prompts
        const caption = await generateSocialMediaCaption(topic, platform, tone, instructions);

        res.status(200).json({
            success: true,
            imageUrl,
            caption,
            platform,
            tone,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate post',
            message: error.message 
        });
    }
}

// BETTER IMAGE GENERATION FOR SOCIAL MEDIA
async function generateSocialMediaImage(topic, platform) {
    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    
    if (!HF_TOKEN) {
        console.log('🤖 Using mock image (HUGGINGFACE_TOKEN not set)');
        return getPlatformSpecificImage(topic, platform);
    }

    try {
        console.log('🎨 Generating social media image...');
        
        // Better prompts for social media
        const prompt = createImagePrompt(topic, platform);
        
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
                        num_inference_steps: 25,
                        guidance_scale: 7.5
                    }
                })
            }
        );

        if (response.status === 503) {
            console.log('⏳ Model loading, using fallback image...');
            return getPlatformSpecificImage(topic, platform);
        }

        if (!response.ok) {
            console.log('❌ Image API failed, using fallback...');
            return getPlatformSpecificImage(topic, platform);
        }

        const imageBuffer = await response.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');
        
        console.log('✅ Image generated successfully');
        return `data:image/png;base64,${imageBase64}`;

    } catch (error) {
        console.error('❌ Image generation failed, using fallback:', error);
        return getPlatformSpecificImage(topic, platform);
    }
}

// BETTER PROMPTS FOR SOCIAL MEDIA IMAGES
function createImagePrompt(topic, platform) {
    const platformStyles = {
        instagram: "instagram post, aesthetic, vibrant colors, high quality, trending, social media, beautiful composition",
        facebook: "facebook post, engaging, professional, clear messaging, social media graphic, attractive",
        twitter: "twitter post, minimal, clean, impactful, social media, attention-grabbing",
        linkedin: "linkedin post, professional, corporate, business, clean, professional photography"
    };

    const style = platformStyles[platform] || platformStyles.instagram;
    
    return `Create a social media image for ${platform} about "${topic}". ${style}. High quality, trending, professional photography, perfect for social media. No text on image.`;
}

// BETTER CAPTION GENERATION
async function generateSocialMediaCaption(topic, platform, tone, instructions) {
    const OR_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OR_API_KEY) {
        console.log('📝 Using optimized mock caption');
        return generateOptimizedCaption(topic, platform, tone);
    }

    try {
        console.log('📝 Generating social media caption...');
        
        const prompt = createCaptionPrompt(topic, platform, tone, instructions);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OR_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.SITE_URL || 'https://social-media-generator.vercel.app',
                'X-Title': 'Social Media Generator'
            },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5', // or 'meta-llama/llama-3.1-8b-instruct'
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 350,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        let caption = data.choices[0].message.content.trim();
        
        // Clean up the caption
        caption = cleanCaption(caption);
        
        console.log('✅ Caption generated successfully');
        return caption;

    } catch (error) {
        console.error('❌ Caption generation failed:', error);
        return generateOptimizedCaption(topic, platform, tone);
    }
}

// BETTER CAPTION PROMPTS
function createCaptionPrompt(topic, platform, tone, instructions) {
    const platformGuidelines = {
        instagram: `
Instagram Post Requirements:
- Use 3-5 relevant hashtags
- Include 2-3 emojis
- Make it visual and engaging
- Keep it under 150 words
- Add a call-to-action (like, share, comment)
- Make it relatable and authentic`,

        facebook: `
Facebook Post Requirements:
- Be conversational and community-focused
- Ask questions to encourage engagement
- Use 2-3 emojis
- Keep it under 200 words
- Include a call-to-action
- Make it shareable`,

        twitter: `
Twitter Post Requirements:
- Keep it concise and punchy
- Maximum 280 characters
- Use 1-2 relevant hashtags
- Include 1-2 emojis
- Make it retweet-worthy
- Add value quickly`,

        linkedin: `
LinkedIn Post Requirements:
- Professional and insightful tone
- Focus on value and learning
- Use industry-relevant terminology
- Keep it under 250 words
- Include 2-3 relevant hashtags
- Professional emojis if any`
    };

    return `You are a social media expert. Create a ${tone} caption for ${platform} about "${topic}".

${platformGuidelines[platform]}

${instructions ? `Additional Instructions: ${instructions}` : 'No additional instructions.'}

Tone: ${tone}

IMPORTANT: 
- Return ONLY the caption text
- No explanations, no markdown
- No quotation marks
- Ready to copy-paste and use immediately
- Make it viral-worthy and engaging`;
}

// CLEAN UP CAPTION
function cleanCaption(caption) {
    // Remove quotes if present
    caption = caption.replace(/^["']|["']$/g, '');
    
    // Remove markdown formatting
    caption = caption.replace(/\*\*(.*?)\*\*/g, '$1');
    caption = caption.replace(/\*(.*?)\*/g, '$1');
    
    // Remove any introductory text
    if (caption.includes('Here is') || caption.includes('Caption:')) {
        const lines = caption.split('\n');
        caption = lines.filter(line => !line.includes('Here is') && !line.includes('Caption:')).join('\n');
    }
    
    return caption.trim();
}

// OPTIMIZED FALLBACK IMAGES
function getPlatformSpecificImage(topic, platform) {
    const platformImages = {
        instagram: `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop&auto=format&q=80&${topic}`,
        facebook: `https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&auto=format&q=80&${topic}`,
        twitter: `https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=400&fit=crop&auto=format&q=80&${topic}`,
        linkedin: `https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=400&fit=crop&auto=format&q=80&${topic}`
    };
    
    return platformImages[platform] || `https://picsum.photos/600/400?random=${Date.now()}&topic=${encodeURIComponent(topic)}`;
}

// OPTIMIZED FALLBACK CAPTIONS
function generateOptimizedCaption(topic, platform, tone) {
    const captions = {
        instagram: {
            inspirational: `🌟 Transform your perspective on ${topic}! ✨\n\nEvery day is a new opportunity to grow and inspire. 💫\n\nWhat's your biggest takeaway from this? Share below! 👇\n\n💖 Double tap if this resonated with you!\n🔔 Follow for daily inspiration\n\n#${topic.replace(/\s+/g, '')} #Inspiration #Motivation #Growth #${tone}`,
            
            professional: `🚀 Elevate your approach to ${topic} with these insights! 📈\n\nProfessional growth starts with the right mindset. 💼\n\nHow do you implement this in your work? Let's discuss! 💬\n\n👍 Like if you found this valuable\n🔗 Share with your network\n\n#${topic.replace(/\s+/g, '')} #Professional #Business #Career #${tone}`,
            
            casual: `Hey everyone! 👋 Let's talk about ${topic} today! 😊\n\nThis is something that's been on my mind lately... 🤔\n\nWhat are your thoughts? Drop a comment! 💭\n\n❤️ Like if you agree\n📲 Share with friends\n\n#${topic.replace(/\s+/g, '')} #Chat #Discussion #Community #${tone}`
        },
        
        facebook: {
            inspirational: `🌟 Ready to be inspired? Today we're exploring ${topic}! ✨\n\nRemember: Small steps lead to big changes. 💫\n\nWhat inspires you the most about this topic? Share your story! 📖\n\nLike 👍 | Comment 💬 | Share 🔄\n\n#${topic.replace(/\s+/g, '')} #Inspiration #Community #Growth`,
            
            professional: `📊 Professional Insight: Mastering ${topic} 🎯\n\nKey strategies that can transform your approach and deliver results. 📈\n\nHow has this topic impacted your professional journey? Let's learn from each other! 🤝\n\nLike 👍 | Comment 💬 | Share 🔄\n\n#${topic.replace(/\s+/g, '')} #ProfessionalDevelopment #Business #Success`,
            
            casual: `Hey friends! 👋 Let's chat about ${topic} today! ☕\n\nThis is something I've been thinking about and wanted to get your perspective... 🤗\n\nWhat's your take on this? The comments are open! 💭\n\nLike 👍 | Comment 💬 | Share 🔄\n\n#${topic.replace(/\s+/g, '')} #Discussion #Community #Thoughts`
        },
        
        twitter: {
            inspirational: `🌟 ${topic}: Your reminder today that growth is possible! ✨\n\nSmall steps, big impact. 💫\n\nWhat's inspiring you right now? 👇\n\n#${topic.replace(/\s+/g, '')} #Inspiration #Motivation\n\n🔁 Retweet if this helped!`,
            
            professional: `💼 ${topic}: Professional insight thread 🧵\n\nKey takeaways that can elevate your game. 🎯\n\nHow are you applying this? 💬\n\n#${topic.replace(/\s+/g, '')} #Professional #Career\n\n🔁 Retweet to share knowledge!`,
            
            casual: `🤔 Thinking about ${topic} today...\n\nWhat's your perspective on this? 💭\n\nLet's discuss! 👇\n\n#${topic.replace(/\s+/g, '')} #Thoughts #Chat\n\n🔁 Retweet to continue the conversation!`
        },
        
        linkedin: {
            inspirational: `🌟 Leadership Insight: The Power of ${topic} ✨\n\nTrue growth often comes from unexpected places. This perspective on ${topic} has transformed approaches across industries. 💫\n\nKey observation: The most successful professionals understand this fundamental principle.\n\nHow has ${topic} influenced your leadership journey? I'd love to hear your experiences. 👇\n\nLike if you found this perspective valuable 🔄 Repost to share with your network\n\n#${topic.replace(/\s+/g, '')} #Leadership #ProfessionalGrowth #CareerDevelopment #BusinessStrategy`,
            
            professional: `📈 Industry Analysis: Mastering ${topic} 🎯\n\nIn today's competitive landscape, understanding ${topic} is no longer optional—it's essential for sustainable growth. 📊\n\nThree critical factors to consider:\n• Strategic implementation\n• Measurable outcomes  \n• Long-term impact\n\nHow is your organization approaching ${topic}? Let's exchange insights in the comments. 💼\n\nLike if this resonates 🔄 Share with your network\n\n#${topic.replace(/\s+/g, '')} #BusinessStrategy #ProfessionalDevelopment #IndustryInsights`,
            
            casual: `💡 Professional Curiosity: Exploring ${topic} 🤔\n\nI've been reflecting on how ${topic} impacts our daily professional lives and the broader industry landscape.\n\nIt's fascinating how perspectives on this evolve with experience and market changes.\n\nWhat's your current take on ${topic}? Have you noticed any shifts in how we approach this? 👇\n\nLet's have a meaningful discussion in the comments! 💬\n\n#${topic.replace(/\s+/g, '')} #ProfessionalThoughts #IndustryChat #CareerReflection`
        }
    };

    return captions[platform]?.[tone] || captions.instagram.inspirational;
}
