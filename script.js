// API Configuration
const API_CONFIG = {
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : '/api',
    endpoints: {
        generatePost: '/generate-post',
        generateImage: '/generate-image',
        generateCaption: '/generate-caption'
    }
};

// App State
const APP_STATE = {
    currentPost: null,
    selections: {
        platform: 'instagram',
        tone: 'inspirational'
    },
    stats: {
        totalPosts: parseInt(localStorage.getItem('totalPosts')) || 0,
        apiCalls: parseInt(localStorage.getItem('apiCalls')) || 0
    }
};

// DOM Elements
const elements = {
    postForm: document.getElementById('postForm'),
    generateBtn: document.getElementById('generateBtn'),
    btnLoading: document.getElementById('btnLoading'),
    btnText: document.querySelector('.btn-text'),
    loadingState: document.getElementById('loadingState'),
    resultState: document.getElementById('resultState'),
    welcomeState: document.getElementById('welcomeState'),
    generatedImage: document.getElementById('generatedImage'),
    generatedCaption: document.getElementById('generatedCaption'),
    totalPosts: document.getElementById('totalPosts'),
    stepImage: document.getElementById('stepImage'),
    stepCaption: document.getElementById('stepCaption'),
    toast: document.getElementById('toast')
};

// Initialize App
function initApp() {
    setupEventListeners();
    updateStats();
    showWelcomeState();
}

// Event Listeners
function setupEventListeners() {
    // Form submission
    elements.postForm.addEventListener('submit', handleFormSubmit);
    
    // Platform selection
    document.querySelectorAll('.platform-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            APP_STATE.selections.platform = card.dataset.platform;
        });
    });
    
    // Tone selection
    document.querySelectorAll('.tone-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.tone-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            APP_STATE.selections.tone = card.dataset.tone;
        });
    });
    
    // Quick topics
    document.querySelectorAll('.topic-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.getElementById('topic').value = chip.dataset.topic;
        });
    });
    
    // Enter key support
    document.getElementById('topic').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFormSubmit(e);
        }
    });
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const topic = document.getElementById('topic').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    
    if (!topic) {
        showToast('Please enter a topic for your post', 'error');
        return;
    }
    
    await generatePost(topic, instructions);
}

// Main Post Generation
async function generatePost(topic, instructions) {
    try {
        showLoadingState();
        updateGenerateButton(true);
        
        // Simulate API calls (Replace with actual API calls)
        const [imageUrl, caption] = await Promise.all([
            generateImageAPI(topic),
            generateCaptionAPI(topic, instructions)
        ]);
        
        // Display results
        displayResults(imageUrl, caption);
        
        // Update stats
        updateStats(true);
        
        showToast('Post generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating post:', error);
        showToast('Failed to generate post. Please try again.', 'error');
        showWelcomeState();
    } finally {
        updateGenerateButton(false);
    }
}

// Generate Image (Hugging Face API)
async function generateImageAPI(topic) {
    APP_STATE.stats.apiCalls++;
    
    // Simulate API call - Replace with actual Hugging Face API
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo - using placeholder. Replace with actual Hugging Face response
            const mockImageUrl = `https://picsum.photos/600/400?random=${Date.now()}&topic=${encodeURIComponent(topic)}`;
            resolve(mockImageUrl);
            
            // Actual implementation would be:
            // const response = await fetch(API_CONFIG.baseURL + API_CONFIG.endpoints.generateImage, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ prompt: topic })
            // });
            // const data = await response.json();
            // return data.imageUrl;
        }, 3000);
    });
}

// Generate Caption (OpenRouter API)
async function generateCaptionAPI(topic, instructions) {
    APP_STATE.stats.apiCalls++;
    
    // Simulate API call - Replace with actual OpenRouter API
    return new Promise((resolve) => {
        setTimeout(() => {
            const platform = APP_STATE.selections.platform;
            const tone = APP_STATE.selections.tone;
            
            const captions = {
                instagram: `🌟 Amazing content about ${topic}! ✨\n\nThis is exactly what you need to see today! 💫\n\nDon't forget to like and share if this inspired you! ❤️\n\n#${topic.replace(/\s+/g, '')} #Inspiration #Motivation #Trending #Viral`,
                facebook: `🚀 Exciting update about ${topic}! \n\nWe're thrilled to share this with our community. What are your thoughts? Share in the comments below! 👇\n\nLike and follow for more amazing content! 👍\n\n#${topic.replace(/\s+/g, '')} #Update #News #Community`,
                twitter: `Quick insight about ${topic}! 💡\n\nThis changes everything! 🎯\n\nRetweet if you find this helpful! 🔁\n\nFollow for more daily tips! 👉\n\n#${topic.replace(/\s+/g, '')} #Tips #Advice #Learn`,
                linkedin: `Professional perspective on ${topic}. 🎯\n\nKey takeaways that can transform your approach. How has this impacted your work? Let's discuss in the comments! 💼\n\nLike and repost to share with your network! 🔄\n\n#${topic.replace(/\s+/g, '')} #Professional #Career #Business`
            };
            
            resolve(captions[platform] || captions.instagram);
            
            // Actual implementation would be:
            // const response = await fetch(API_CONFIG.baseURL + API_CONFIG.endpoints.generateCaption, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ 
            //         topic, 
            //         instructions,
            //         platform: APP_STATE.selections.platform,
            //         tone: APP_STATE.selections.tone
            //     })
            // });
            // const data = await response.json();
            // return data.caption;
        }, 2000);
    });
}

// UI State Management
function showLoadingState() {
    elements.welcomeState.classList.add('hidden');
    elements.resultState.classList.add('hidden');
    elements.loadingState.classList.remove('hidden');
    
    // Reset and activate loading steps
    elements.stepImage.classList.remove('active');
    elements.stepCaption.classList.remove('active');
    
    // Simulate step progression
    setTimeout(() => elements.stepImage.classList.add('active'), 1000);
    setTimeout(() => elements.stepCaption.classList.add('active'), 2500);
}

function showResultState() {
    elements.welcomeState.classList.add('hidden');
    elements.loadingState.classList.add('hidden');
    elements.resultState.classList.remove('hidden');
}

function showWelcomeState() {
    elements.loadingState.classList.add('hidden');
    elements.resultState.classList.add('hidden');
    elements.welcomeState.classList.remove('hidden');
}

function displayResults(imageUrl, caption) {
    elements.generatedImage.src = imageUrl;
    elements.generatedCaption.textContent = caption;
    showResultState();
}

function updateGenerateButton(loading) {
    if (loading) {
        elements.generateBtn.classList.add('loading');
        elements.generateBtn.disabled = true;
    } else {
        elements.generateBtn.classList.remove('loading');
        elements.generateBtn.disabled = false;
    }
}

// Action Functions
async function downloadImage() {
    try {
        const response = await fetch(elements.generatedImage.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `social-media-post-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Image downloaded successfully!', 'success');
    } catch (error) {
        showToast('Failed to download image', 'error');
    }
}

async function refreshImage() {
    const topic = document.getElementById('topic').value.trim();
    if (!topic) {
        showToast('Please enter a topic first', 'error');
        return;
    }
    
    try {
        showToast('Generating new image...', 'info');
        const newImageUrl = await generateImageAPI(topic);
        elements.generatedImage.src = newImageUrl;
        showToast('New image generated!', 'success');
    } catch (error) {
        showToast('Failed to generate new image', 'error');
    }
}

async function regenerateCaption() {
    const topic = document.getElementById('topic').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    
    if (!topic) {
        showToast('Please enter a topic first', 'error');
        return;
    }
    
    try {
        showToast('Rewriting caption...', 'info');
        const newCaption = await generateCaptionAPI(topic, instructions);
        elements.generatedCaption.textContent = newCaption;
        showToast('Caption rewritten!', 'success');
    } catch (error) {
        showToast('Failed to rewrite caption', 'error');
    }
}

function copyCaption() {
    const caption = elements.generatedCaption.textContent;
    navigator.clipboard.writeText(caption).then(() => {
        showToast('Caption copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy caption', 'error');
    });
}

function sharePost() {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this AI-generated post!',
            text: elements.generatedCaption.textContent,
            url: window.location.href
        }).then(() => {
            showToast('Post shared successfully!', 'success');
        }).catch(() => {
            showToast('Share cancelled', 'info');
        });
    } else {
        copyCaption();
    }
}

// Stats Management
function updateStats(newPost = false) {
    if (newPost) {
        APP_STATE.stats.totalPosts++;
        localStorage.setItem('totalPosts', APP_STATE.stats.totalPosts);
        localStorage.setItem('apiCalls', APP_STATE.stats.apiCalls);
    }
    
    elements.totalPosts.textContent = APP_STATE.stats.totalPosts.toLocaleString();
}

// Toast Notifications
function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = 'toast';
    
    switch (type) {
        case 'success':
            elements.toast.style.background = 'var(--success)';
            break;
        case 'error':
            elements.toast.style.background = 'var(--error)';
            break;
        case 'warning':
            elements.toast.style.background = 'var(--warning)';
            break;
        default:
            elements.toast.style.background = 'var(--dark)';
    }
    
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
          }
