// script.js - REAL API VERSION
const API_CONFIG = {
    baseURL: window.location.origin + '/api',
    endpoints: {
        generatePost: '/generate-post'
    }
};

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
    btnLoading: document.querySelector('.btn-loading'),
    btnText: document.querySelector('.btn-text'),
    loadingState: document.getElementById('loadingState'),
    resultState: document.getElementById('resultState'),
    welcomeState: document.getElementById('welcomeState'),
    generatedImage: document.getElementById('generatedImage'),
    generatedCaption: document.getElementById('generatedCaption'),
    totalPosts: document.getElementById('totalPosts')
};

// Initialize App
function initApp() {
    setupEventListeners();
    updateStats();
    showWelcomeState();
}

// Event Listeners
function setupEventListeners() {
    elements.postForm.addEventListener('submit', handleFormSubmit);
    
    document.querySelectorAll('.platform-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            APP_STATE.selections.platform = this.dataset.platform;
        });
    });
    
    document.querySelectorAll('.tone-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.tone-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            APP_STATE.selections.tone = this.dataset.tone;
        });
    });
    
    document.querySelectorAll('.topic-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.getElementById('topic').value = this.dataset.topic;
        });
    });
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const topic = document.getElementById('topic').value.trim();
    const instructions = document.getElementById('instructions') ? document.getElementById('instructions').value.trim() : '';
    
    if (!topic) {
        showToast('Please enter a topic for your post!', 'error');
        return;
    }
    
    await generatePost(topic, instructions);
}

// Main Post Generation
async function generatePost(topic, instructions) {
    try {
        showLoadingState();
        updateGenerateButton(true);
        
        const response = await fetch(API_CONFIG.baseURL + API_CONFIG.endpoints.generatePost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                platform: APP_STATE.selections.platform,
                tone: APP_STATE.selections.tone,
                instructions: instructions
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to generate post');
        }
        
        displayResults(data.imageUrl, data.caption);
        updateStats(true);
        showToast('Post generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating post:', error);
        showToast(error.message || 'Failed to generate post. Please try again.', 'error');
        showWelcomeState();
    } finally {
        updateGenerateButton(false);
    }
}

// UI Functions
function showLoadingState() {
    elements.welcomeState.classList.add('hidden');
    elements.resultState.classList.add('hidden');
    elements.loadingState.classList.remove('hidden');
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

async function regenerateCaption() {
    const topic = document.getElementById('topic').value.trim();
    const instructions = document.getElementById('instructions') ? document.getElementById('instructions').value.trim() : '';
    
    if (!topic) {
        showToast('Please enter a topic first', 'error');
        return;
    }
    
    try {
        showToast('Rewriting caption...', 'info');
        const response = await fetch(API_CONFIG.baseURL + API_CONFIG.endpoints.generatePost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                platform: APP_STATE.selections.platform,
                tone: APP_STATE.selections.tone,
                instructions: instructions
            })
        });

        const data = await response.json();
        
        if (data.success) {
            elements.generatedCaption.textContent = data.caption;
            showToast('Caption rewritten!', 'success');
        } else {
            throw new Error(data.error);
        }
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

// Stats Management
function updateStats(newPost = false) {
    if (newPost) {
        APP_STATE.stats.totalPosts++;
        localStorage.setItem('totalPosts', APP_STATE.stats.totalPosts);
    }
    
    elements.totalPosts.textContent = APP_STATE.stats.totalPosts.toLocaleString();
}

// Toast Notifications
function showToast(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#10b981' : 
                            type === 'error' ? '#ef4444' : 
                            type === 'warning' ? '#f59e0b' : '#1f2937';
    
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
