// In your script.js, replace the generatePost function with this:

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

        if (!response.ok) {
            throw new Error('Server error. Please try again.');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Generation failed');
        }
        
        // Display results
        displayResults(data.imageUrl, data.caption);
        updateStats(true);
        showToast('✅ Post generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ ' + error.message, 'error');
        showWelcomeState();
    } finally {
        updateGenerateButton(false);
    }
}
