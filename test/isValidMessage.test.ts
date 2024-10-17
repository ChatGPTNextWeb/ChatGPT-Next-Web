function isValidMessage(message: any): boolean {
    if (typeof message !== "string") {
        return false;
    }
    message = message.trim();
    if (message.startsWith("```") && message.endsWith("```")) {
        const codeBlockContent = message.slice(3, -3).trim();
        const jsonString = codeBlockContent.replace(/^json\s*/i, '').trim();
        try {
            // 返回 json 格式消息，error 字段为 true 或者包含 error.message 字段，判定为错误回复，否则为正常回复
            const jsonObject = JSON.parse(jsonString);
            if (jsonObject?.error == true || jsonObject?.error?.message) {
                return false;
            }
            return true;
        } catch (e) {
            console.log("Invalid JSON format.");
            // 非 json 格式，通常可认为是正常回复
            return true;
        }
    }
    return true;
}

describe("is valid message module", () => {
    // 0. 正常的 string 文本
    test("string msg", () => {
        const message = "Hello! How can I assist you today?";
        expect(isValidMessage(message)).toBe(true);
    });
    // 1. 一些可能的错误消息
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

    // 2. 仅包含 ``` 的字符串
    test("only code block markers", () => {
        const message = "``` ```";
        expect(isValidMessage(message)).toBe(true); // 空代码块，视为正常回复
    });
    test("only opening code block marker", () => {
        const message = "```json\n{ \"key\": \"value\" }";
        expect(isValidMessage(message)).toBe(true); // 不完整的代码块
    });
    test("only closing code block marker", () => {
        const message = "{ \"key\": \"value\" } ```";
        expect(isValidMessage(message)).toBe(true); // 不完整的代码块
    });
    // 3. 非 JSON 格式的代码块
    test("code block with non-JSON content - plain text", () => {
        const message = `
\`\`\`json
This is not a JSON string.
\`\`\`
        `;
        expect(isValidMessage(message)).toBe(true); // 解析失败，视为正常回复
    });
    test("code block with non-JSON content - JavaScript", () => {
        const message = `
\`\`\`js
function hello() {
    console.log("Hello, world!");
}
\`\`\`
        `.trim();
        expect(isValidMessage(message)).toBe(true); // 解析失败，视为正常回复
    });

    // 4. JSON 格式但不包含 'error' 字段
    test("JSON without error field", () => {
        const message = `
\`\`\`json
{
    "message": "Operation successful",
    "data": {
        "id": 1,
        "name": "Test"
    }
}
\`\`\`
        `;
        expect(isValidMessage(message)).toBe(true); // 无 error 字段，视为正常回复
    });

    // 5. JSON 格式，'error' 字段为 false
    test("JSON with 'error': false", () => {
        const message = `
\`\`\`json
{
    "error": false,
    "message": "Everything is fine."
}
\`\`\`
        `;
        expect(isValidMessage(message)).toBe(true); // error 为 false，视为正常回复
    });
});