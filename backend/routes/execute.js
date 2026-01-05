const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// Judge0 Language IDs
const LANGUAGE_MAP = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62
};

router.post('/', async (req, res) => {
    try {
        const { language, sourceCode } = req.body;

        if (!sourceCode) {
            return res.status(400).json({ message: 'Source code is required' });
        }

        const languageId = LANGUAGE_MAP[language];
        if (!languageId) {
            return res.status(400).json({ message: 'Unsupported language' });
        }

        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions',
            params: { base64_encoded: 'false', fields: '*' },
            headers: {
                'content-type': 'application/json',
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: {
                language_id: languageId,
                source_code: sourceCode
            }
        };

        // 1. Submit Code
        let submission;
        try {
            submission = await axios.request(options);
        } catch (err) {
            console.error('Judge0 Submission Error:', err.response?.data || err.message);
            return res.status(502).json({ 
                message: 'Failed to submit code to Judge0', 
                error: err.response?.data?.message || err.message 
            });
        }

        const token = submission.data.token;

        // 2. Poll for Result
        let result = null;
        let attempts = 0;
        
        while (attempts < 10) {
            await new Promise(r => setTimeout(r, 1000)); // Wait 1s
            
            try {
                const check = await axios.request({
                    method: 'GET',
                    url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
                    params: { base64_encoded: 'false', fields: '*' },
                    headers: {
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    }
                });

                if (check.data.status.id >= 3) { // 3 = Finished (Accepted/Error)
                    result = check.data;
                    break;
                }
            } catch (err) {
                 console.error('Judge0 Polling Error:', err.response?.data || err.message);
                 // Don't fail immediately on polling error, retry
            }
            attempts++;
        }

        if (!result) {
            return res.status(408).json({ message: 'Execution timed out' });
        }

        res.json({
            success: true, // Frontend can check this
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output,
            status: result.status,
            time: result.time,
            memory: result.memory,
            // Pass raw error context if available
            error: result.stderr || result.compile_output || null 
        });

    } catch (error) {
        console.error('Execution Route Critical Error:', error);
        res.status(500).json({ 
            message: 'Internal Server Error during execution', 
            error: error.message 
        });
    }
});

module.exports = router;
