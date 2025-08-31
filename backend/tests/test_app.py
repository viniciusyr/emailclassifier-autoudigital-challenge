# test_app.py
import pytest
from fastapi.testclient import TestClient
from app import app, running_tasks

client = TestClient(app)

def test_read_json():
    response = client.post("/read/json", json={"text": "Email de teste"})
    assert response.status_code == 200
    data = response.json()
    assert "Categoria" in data
    assert "Resposta" in data

def test_read_text():
    response = client.post("/read", data={"text": "Primeiro email.\nSegundo email"})
    assert response.status_code == 200
    lines = response.content.decode().split("\n")
    
    process_id_event = lines[0].strip()
    assert process_id_event != ""
    process_id_data = json.loads(process_id_event)
    assert "process_id" in process_id_data
    process_id = process_id_data["process_id"]
    assert process_id in running_tasks

    total_event = lines[1].strip()
    total_data = json.loads(total_event)
    assert "total" in total_data
    assert total_data["total"] == 2

    for line in lines[2:]:
        if line.strip() == "":
            continue
        result = json.loads(line)
        assert "Categoria" in result
        assert "Resposta" in result

def test_stop_process():
    fake_id = "fake123"
    running_tasks[fake_id] = True

    response = client.post(f"/stop/{fake_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "stopped"
    assert data["process_id"] == fake_id
    assert running_tasks[fake_id] == False

    response = client.post("/stop/notexist")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_found"
