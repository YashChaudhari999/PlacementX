import urllib.request
import json

def search_github(filename):
    url = f"https://api.github.com/search/code?q={filename}+in:path"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            for item in data.get('items', []):
                raw_url = item['html_url'].replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
                print(raw_url)
                return raw_url
    except Exception as e:
        print("Error:", e)
    return None

search_github("Placement_Data_Full_Class.csv")
search_github("job_skills.csv")
