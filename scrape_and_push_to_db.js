import axios from "axios";
import { scrapeGoodNews } from "./scraper.js"

const scrape_and_push_to_db = async () => {
    try{
        let scraped_news = await scrapeGoodNews()
        for(let i = 0; i < scraped_news?.length; i++){
            let news = scraped_news[i];
            await axios.post(
                'https://makemydaybackend-production.up.railway.app/mmd/v1/posts/create-post',
                {
                    "type": "news",
                    "title": news['title'],
                    "description": news['description'] ? news['description'] : '',
                    "tags": news['tags'],
                    "media_url": news['imageUrl'],
                    "external_url": news['link'],
                    "post_date": news['date']
                  }
            ).then(res => {
                console.log(res.data)
            }).catch(err => {
                console.log(err.response.data)
            })
        }
    } catch(error){
        console.log(error)
    }
}

scrape_and_push_to_db()