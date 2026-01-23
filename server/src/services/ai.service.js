// AI Validation Service - Mock implementation
// Replace with actual AI service integration

import config from '../config/env.config.js';

export const validateIssueWithAI = async (imageUrl, description, category) => {
    try {
        // TODO: Replace with actual AI API call (Gemini/OpenAI/Custom)
        // For now, mock validation
        
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock AI response - In production, send image and description to AI
        const mockValidation = {
            validated: true,
            matchesDescription: true,
            confidence: 0.85 + Math.random() * 0.15, // Random confidence between 0.85-1.0
            aiResponse: `The image appears to match the description of a ${category} issue. The ${category} problem is clearly visible in the submitted image.`,
            detectedCategory: category
        };
        
        // Simulate occasional rejection
        if (Math.random() < 0.1) { // 10% rejection rate for testing
            return {
                validated: true,
                matchesDescription: false,
                confidence: 0.45,
                aiResponse: `The image does not clearly match the described ${category} issue. Please submit a clearer image that shows the problem.`,
                detectedCategory: "unknown"
            };
        }
        
        return mockValidation;
    } catch (error) {
        console.error('AI Validation Error:', error);
        throw new Error('AI validation failed');
    }
};

// Function to get location details from coordinates using Google Geocoding
export const getLocationDetails = async (lat, lng) => {
    try {
        const apiKey = config.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return {
                address: 'Unknown',
                city: 'Unknown',
                state: 'Unknown',
                country: 'India'
            };
        }
        
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            const addressComponents = result.address_components;
            
            let city = '', state = '', country = '';
            
            for (const component of addressComponents) {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                } else if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                } else if (component.types.includes('country')) {
                    country = component.long_name;
                }
            }
            
            return {
                address: result.formatted_address,
                city: city || 'Unknown',
                state: state || 'Unknown',
                country: country || 'India'
            };
        }
        
        return {
            address: 'Unknown',
            city: 'Unknown',
            state: 'Unknown',
            country: 'India'
        };
    } catch (error) {
        console.error('Geocoding Error:', error);
        return {
            address: 'Unknown',
            city: 'Unknown',
            state: 'Unknown',
            country: 'India'
        };
    }
};
