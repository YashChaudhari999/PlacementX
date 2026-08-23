import os
import pandas as pd
import json

base_dir = "Student_data"
schema_info = {}

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".xlsx"):
            path = os.path.join(root, file)
            try:
                df = pd.read_excel(path, nrows=5)
                schema_info[path] = list(df.columns)
            except Exception as e:
                schema_info[path] = str(e)

with open("excel_schema.json", "w") as f:
    json.dump(schema_info, f, indent=4)
print("done")
