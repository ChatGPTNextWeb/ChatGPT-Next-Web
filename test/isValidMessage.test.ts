function isValidMessage(message: any): boolean {
    if (typeof message !== "string") {
        return false;
    }
    if (message.startsWith("```") && message.endsWith("```")) {
        const codeBlockContent = message.slice(3, -3).trim();
        const jsonString = codeBlockContent.replace(/^json\s*/i, '').trim();
        try {
            // 返回 json 格式消息，含 error.message 字段，判定为错误回复，否则为正常回复
            const jsonObject = JSON.parse(jsonString);
            if (jsonObject?.error == true || jsonObject?.error?.message) {
                return false;
            }
            return true;
        } catch (e) {
            console.log("Invalid JSON format.");
            // 非 json 格式，大概率是正常回复
            return true;
        }
    }
    return true;
}

describe("is valid message module", () => {
    test("error msg no.0", () => {
        const message = "Hello! How can I assist you today?";
        expect(isValidMessage(message)).toBe(true);
    });
    test("error msg no.1", () => {
        const message = `
        \`\`\`json
        {
            "error": true,
            "msg": "金额不足"
        }
        \`\`\`
        `;
        expect(isValidMessage(message)).toBe(false);
    });
    test("error msg no.2", () => {
        const message = `
        \`\`\`
        {
            "error": {
                "message": "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY), or as the password field (with blank username) if you're accessing the API from your browser and are prompted for a username and password. You can obtain an API key from https://platform.openai.com/account/api-keys.",
                "type": "invalid_request_error",
                "param": null,
                "code": null
            }
        }
        \`\`\`
        `;
        expect(isValidMessage(message)).toBe(false);
    });
    test("error msg no.3", () => {
        const message = `
        \`\`\`
        {
            "error": {
                "message": "Incorrect API key provided: 123456. You can find your API key at https://platform.openai.com/account/api-keys.",
                "type": "invalid_request_error",
                "param": null,
                "code": "invalid_api_key"
            }
        }
        \`\`\`
        `;
        expect(isValidMessage(message)).toBe(false);
    });
    test("error msg no.4", () => {
        const message = `
        \`\`\`
        {
            "error": {
                "message": "当前分组 default 下对于模型 gpt-4 无可用渠道 (request id: 2024101214105418395279367750613)",
                "type": "one_api_error"
            }
        }
        \`\`\`
        `;
        expect(isValidMessage(message)).toBe(false);
    });
    test("error msg no.5", () => {
        const message = `
        \`\`\`
        {
            "error": {
                "message": "该令牌状态不可用 (request id: 2024101214105418395279367750613)",
                "type": "one_api_error"
            }
        }
        \`\`\`
        `;
        expect(isValidMessage(message)).toBe(false);
    });
});