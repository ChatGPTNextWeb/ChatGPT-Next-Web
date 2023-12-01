from typing import Optional, Any
from flask import Flask, request
from dotenv import load_dotenv
import atexit
from src.conversation_manager import (
    chat,
    has_conversation, 
    initialize_conversation
)
import logging

logging.basicConfig(level=logging.INFO)
file_handler = logging.FileHandler("./logs/app.log")
file_handler.setLevel(logging.INFO)
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.INFO)
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt="%Y-%m-%d %H:%M:%S"
)
file_handler.setFormatter(formatter)
stream_handler.setFormatter(formatter)
root_logger = logging.getLogger()
root_logger.addHandler(file_handler)
root_logger.addHandler(stream_handler)

from src.job_recycle_conversations import run_scheduled_job_continuously

load_dotenv()
cease_event = run_scheduled_job_continuously()
def onExit():
    cease_event.set()
atexit.register(onExit)

app = Flask(__name__)

def get_params_from_json_body(json: Optional[Any], name: str, defaultVal: Optional[Any]) -> Optional[Any]:
    if not json:
        return defaultVal
    if name in json:
        return json[name]
    return defaultVal

@app.route('/v1/chat/completions', methods=['POST'])
def handle():
    print("[post] completions")
    auth = request.headers.get("Authorization")
    auth = auth if auth is not None and len(auth) > 0 else ""
    jsonBody = request.json
    sessionId = get_params_from_json_body(jsonBody, "session_id", defaultVal="")
    messages = get_params_from_json_body(jsonBody, "messages", defaultVal=[])
    model = get_params_from_json_body(jsonBody, "model", defaultVal="gpt-3.5-turbo")
    temperature = get_params_from_json_body(jsonBody, "temperature", defaultVal=0.7)
    presence_penalty = get_params_from_json_body(jsonBody, "presence_penalty", defaultVal=0)
    frequency_penalty = get_params_from_json_body(jsonBody, "frequency_penalty", defaultVal=0)
    top_p = get_params_from_json_body(jsonBody, "top_p", defaultVal=1)
    if not has_conversation(sessionId):
        initialize_conversation(
            session=sessionId,
            modelConfig={
                "temperature": temperature,
                "presence_penalty": presence_penalty,
                "frequency_penalty": frequency_penalty,
                "top_p": top_p,
                "model": model,
                "auth": auth
            }
        )
    try:
        (msg, usage) = chat(sessionId, messages, auth)
        return {"choices": [{"index": 0, "message": {"role": "assistant", "content": msg}, "finish_reason": "stop"}], "usage": usage}
    except Exception as e:
        return {"error": str(e)}

