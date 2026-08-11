import os
import json
import time
import urllib.request
import urllib.parse
from PIL import Image

dest_dir = r"c:\Users\USER\Desktop\new\agriculture\images"
os.makedirs(dest_dir, exist_ok=True)

# Corrected queries targeting only high-quality, actual photo descriptions
search_queries = {
    # Crop Cards
    "crop_rice.webp": "rice field crop",
    "crop_wheat.webp": "wheat crop field",
    "crop_toor_dal.webp": "pigeon peas seeds",
    "crop_chickpea.webp": "raw chickpea seeds",
    "crop_mustard.webp": "mustard flowers field",
    "crop_soybean.webp": "soybean seeds",
    "crop_mixed_veg.webp": "vegetables harvest",
    "crop_cotton.webp": "cotton bolls plant",
    "crop_seeds.webp": "crop seeds heap",
    
    # Product Cards
    "prod_corn.webp": "corn ears maize",
    "prod_compost.webp": "compost soil fertilizer",
    "prod_neem.webp": "herbal oil bottle",
    "prod_sprayer.webp": "backpack sprayer agriculture",
    "prod_drip.webp": "drip irrigation tube",
    "prod_tonic.webp": "liquid fertilizer bottle",
    
    # Categories / Home Cards
    "prod_seeds.webp": "agricultural seeds",
    "prod_fertilizers.webp": "fertilizer bag crop",
    "prod_pesticides.webp": "pesticide bottle spray",
    "prod_irrigation.webp": "sprinkler irrigation field",
    "prod_tools.webp": "gardening spade tools",
    
    # Blogs
    "blog_1.webp": "fertile soil agriculture",
    "blog_2.webp": "spraying pesticide crop",
    "blog_3.webp": "agriculture harvest market"
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
temp_file = os.path.join(dest_dir, "temp_wiki_robust")

def make_request(url, max_retries=5):
    delay = 3
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.read()
        except urllib.error.HTTPError as he:
            if he.code == 429:
                print(f"Rate limited (429). Retrying in {delay}s...")
                time.sleep(delay)
                delay *= 2
            else:
                print(f"HTTP Error {he.code} for URL: {url}")
                return None
        except Exception as e:
            print(f"Error requesting URL {url}: {e}")
            return None
    print(f"Max retries reached for: {url}")
    return None

def search_wikimedia(query):
    encoded_query = urllib.parse.quote(query)
    search_url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={encoded_query}&srnamespace=6&format=json&srlimit=10"
    
    res = make_request(search_url)
    if not res:
        return None
        
    try:
        res_data = json.loads(res.decode('utf-8'))
        search_results = res_data.get('query', {}).get('search', [])
        
        # Filter for valid image formats
        valid_extensions = ('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
        for result in search_results:
            title = result['title']
            if title.lower().endswith(valid_extensions):
                return title
    except Exception as e:
        print(f"Failed to parse search results for '{query}': {e}")
    return None

def get_image_url(file_title):
    encoded_title = urllib.parse.quote(file_title)
    info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={encoded_title}&prop=imageinfo&iiprop=url&format=json"
    
    res = make_request(info_url)
    if not res:
        return None
        
    try:
        res_data = json.loads(res.decode('utf-8'))
        pages = res_data.get('query', {}).get('pages', {})
        for page_id, page_info in pages.items():
            imageinfo = page_info.get('imageinfo', [])
            if imageinfo:
                return imageinfo[0]['url']
    except Exception as e:
        print(f"Failed to parse details for '{file_title}': {e}")
    return None

# Process each image with rate limit protection
for filename, query in search_queries.items():
    print(f"\n--- Processing '{filename}' ('{query}') ---")
    
    title = search_wikimedia(query)
    if not title:
        print(f"Could not find valid image title for query '{query}'")
        continue
        
    print(f"Title found: {title}")
    time.sleep(1) # gap between search and details call
    
    img_url = get_image_url(title)
    if not img_url:
        print(f"Could not find image URL for '{title}'")
        continue
        
    print(f"Downloading: {img_url}")
    time.sleep(1) # gap between details call and download call
    
    img_data = make_request(img_url)
    if not img_data:
        print(f"Failed to download image from {img_url}")
        continue
        
    try:
        with open(temp_file, 'wb') as f:
            f.write(img_data)
        
        # Convert to WebP and resize to max 450x450
        with Image.open(temp_file) as img:
            img.thumbnail((450, 450))
            img.save(os.path.join(dest_dir, filename), "webp")
        print(f"Saved: '{filename}'")
    except Exception as e:
        print(f"Conversion error for '{filename}': {e}")
        
    # Standard sleep to respect rate limits
    time.sleep(2)

if os.path.exists(temp_file):
    os.remove(temp_file)

print("\nFinished downloading and converting WebP files.")
