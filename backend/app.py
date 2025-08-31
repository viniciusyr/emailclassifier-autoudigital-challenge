from fastapi import FastAPI, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from classifier import classify_email
from process_email import process_email
from split_emails import split_emails
import json
import uuid
import asyncio

app = FastAPI(title="Email Classifier - AutoU")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://emailclassifier-autoudigital-challenge-8o1l60ynu.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

running_tasks = {}

class EmailInput(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/read/json")
async def read_email_json(input: EmailInput):
    content = input.text
    result = classify_email(content)
    return result

@app.post("/read")
async def read_email(files: list[UploadFile] = None, text: str = Form(None)):
    contents = []

    if files:
        for file in files:
            raw = (await file.read()).decode("utf-8", errors="ignore")
            contents.append(raw)
    elif text:
        contents.append(text)
    else:
        return {"error": "Invalid data"}

    process_id = str(uuid.uuid4())
    running_tasks[process_id] = True 

    async def event_stream():
        yield json.dumps({"process_id": process_id}) + "\n"
        all_emails = []

        for raw in contents:
            all_emails.extend(split_emails(raw))

        yield json.dumps({"total": len(all_emails)}) + "\n"

        for email in all_emails:
            
            if not running_tasks.get(process_id, False):
                print(f"Processamento {process_id} cancelado")
                break

            await asyncio.sleep(0)

            clean_text = process_email(email)
            result = classify_email(clean_text)
            yield json.dumps(result) + "\n"

        running_tasks.pop(process_id, None)

    return StreamingResponse(event_stream(), media_type="application/json")


@app.post("/stop/{process_id}")
def stop_process(process_id: str):
    if process_id in running_tasks:
        running_tasks[process_id] = False
        return {"status": "stopped", "process_id": process_id}
    return {"status": "not_found", "process_id": process_id}
