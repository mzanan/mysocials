#!/usr/bin/env python3
import instaloader
import sys
import json
import os
from pathlib import Path

def scrape_instagram(username, output_dir, count=12):
    try:
        L = instaloader.Instaloader(
            download_videos=False,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
            post_metadata_txt_pattern='',
            max_connection_attempts=1
        )
        
        profile = instaloader.Profile.from_username(L.context, username)
        
        posts = []
        for i, post in enumerate(profile.get_posts()):
            if i >= count:
                break
            
            try:
                L.download_post(post, target=output_dir)
                
                image_files = list(Path(output_dir).glob(f"{post.date_utc.strftime('%Y-%m-%d_%H-%M-%S')}_UTC*.jpg"))
                if not image_files:
                    image_files = list(Path(output_dir).glob(f"*.jpg"))
                
                if image_files:
                    posts.append(str(image_files[0].name))
            except Exception as e:
                print(f"Error downloading post: {e}", file=sys.stderr)
                continue
        
        print(json.dumps({"success": True, "images": posts}))
        return 0
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Usage: instagram_scraper.py <username> <output_dir> [count]"}))
        sys.exit(1)
    
    username = sys.argv[1]
    output_dir = sys.argv[2]
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 12
    
    os.makedirs(output_dir, exist_ok=True)
    
    sys.exit(scrape_instagram(username, output_dir, count))

