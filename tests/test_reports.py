def test_run_report(client):
    resp = client.post("/reports/run", json={"template": {"type": "fuel_cost"}})
    assert resp.status_code == 200
    data = resp.json()
    assert "headers" in data
    assert "csv" in data


def test_ai_report_builder(client):
    resp = client.post("/ai/report-builder", json={"prompt": "fuel cost"})
    assert resp.status_code == 200
    assert "template" in resp.json()
