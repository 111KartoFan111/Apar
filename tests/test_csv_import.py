def test_vehicle_csv_import(client):
    csv_content = "plate_number,model,manufacturer\nTEST-1,Model X,Tesla\n,Missing,\n"
    response = client.post(
        "/vehicles/import",
        files={"file": ("vehicles.csv", csv_content, "text/csv")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["imported"] == 1
    assert any("Row 3" in err for err in body["errors"])
