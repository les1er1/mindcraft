export class Blackbox {
    constructor(model_name, url) {
        this.model_name = model_name;
        this.url = url || 'https://www.blackbox.ai';
        this.chat_endpoint = 'https://www.blackbox.ai/api/chat';
        this.embedding_endpoint = '/api/embeddings';
    }

    static data = this.constructor;

    static defaultModel = 'blackbox';
    static models = [
        'blackbox',
        'gemini-1.5-flash',
        "llama-3.1-8b",
        'llama-3.1-70b',
        'llama-3.1-405b',
        'gpt-4o',
        'gemini-pro',
        'claude-sonnet-3.5',
    ];

    static agentMode = {};

    static trendingAgentMode = {
        "blackbox": {},
        "gemini-1.5-flash": { mode: true, id: 'Gemini' },
        "llama-3.1-8b": { mode: true, id: "llama-3.1-8b" },
        'llama-3.1-70b': { mode: true, id: "llama-3.1-70b" },
        'llama-3.1-405b': { mode: true, id: "llama-3.1-405b" },
    };

    static userSelectedModel = {
        "gpt-4o": "gpt-4o",
        "gemini-pro": "gemini-pro",
        'claude-sonnet-3.5': "claude-sonnet-3.5",
    };

    static modelAliases = {
        "gemini-flash": "gemini-1.5-flash",
    };

    static getModel(model) {
        if (Blackbox.models.includes(model)) {
            return model;
        } else if (model in Blackbox.userSelectedModel) {
            return model;
        } else if (model in Blackbox.modelAliases) {
            return Blackbox.modelAliases[model];
        } else {
            return Blackbox.defaultModel;
        }
    }

    async sendRequest(turns, systemMessage, stop_seq='***') {
        let messages = [/*{'role': 'system', 'content': systemMessage}*/].concat(turns);
        const headers = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "origin": this.url,
            "pragma": "no-cache",
            "referer": `${this.url}/`,
            "sec-ch-ua": '"Not;A=Brand";v="24", "Chromium";v="128"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        };

        const proxy = null;

        let prefix = "@Claude-Sonnet-3.5";
        if (!messages[0]['content'].startsWith(prefix)) {
            messages[0]['content'] = `${prefix} ${messages[0]['content']}`;
        }

        console.log(messages);

        const response = await fetch(this.chat_endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                messages,
                id: Math.random().toString(36).substr(2, 7),
                previewToken: null,
                userId: null,
                codeModelMode: true,
                agentMode: {},
                trendingAgentMode: {},
                userSelectedModel: null,
                userSystemPrompt: systemMessage,
                isMicMode: false,
                maxTokens: 1024,
                playgroundTopP: 0.9,
                playgroundTemperature: 0.5,
                isChromeExt: false,
                githubToken: null,
                clickedAnswer2: false,
                clickedAnswer3: false,
                clickedForceWebSearch: false,
                visitFromDelta: false,
                mobileClient: false,
                webSearchMode: false,
            }),
            proxy
        });

        const reader = response.body.getReader();
        let text = '';
        try {
            console.log('Awaiting blackbox api response...');
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const decodedChunk = new TextDecoder('utf-8').decode(value);
                const cleanedChunk = decodedChunk.replace(/\$@\$v=[^$]+\$@\$/, '');
                if (cleanedChunk.trim()) {
                    text += cleanedChunk;
                }
            }
            console.log('Received.');
        } catch (err) {
            console.log(err);
        }
        /*if (text.trim() === '') {
            console.log('Received empty response, retrying...');
            return await this.sendRequest(turns, systemMessage, stop_seq);
        }*/
        return text
    }
}