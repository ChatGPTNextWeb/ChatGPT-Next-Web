
from src.conversation_manager import (
    get_conversation, 
    has_conversation,
    initialize_conversation, 
    parse_api_key,
    remove_conversation
)

def test_parse_api_key():
    res = parse_api_key("Bearer balahbalah")
    assert res == "balahbalah"

def test_get_conversation():
    conversation = get_conversation("balahbalah")
    assert conversation is not None
    assert conversation.sessionId == "balahbalah"
    assert conversation.chatter is not None
    assert has_conversation("balahbalah") 

def test_remove_conversation():
    sessionId = "test"
    assert not has_conversation(sessionId)
    initialize_conversation(
        session=sessionId,
        modelConfig={
            "model": "gpt-3.5-turbo",
            "temperature": 0.7,
            "max_tokens": 2000,
            "presence_penalty": 0,
            "frequency_penalty": 0,
            "sendMemory": True,
            "historyMessageCount": 4,
            "compressMessageLengthThreshold": 2000,
        }
    )
    assert has_conversation(sessionId)
    remove_conversation(sessionId)
    assert not has_conversation(sessionId)


