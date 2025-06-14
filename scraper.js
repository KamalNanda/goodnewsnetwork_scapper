import axios from 'axios' 
import * as cheerio from 'cheerio';
const BASE_URL = "https://www.goodnewsnetwork.org";


export const scrapeGoodNews = async () =>  {
    let articles = [];
    try {
        const { data } = await axios.get(BASE_URL, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);

        // Loop through articles found on the page 
        const articlePromises = $(".td_module_wrap").map(async (index, element) => {
            const title = $(element).find(".entry-title a").text().trim();
            const link = $(element).find(".td-module-thumb a").attr("href");
            const imageUrl = $(element).find(".td-module-thumb a img").attr("src");
            const tag = $(element).find(".td-module-meta-info .float-right a").text().trim();
            const date = $(element).find(".td-module-meta-info .td-post-date time").text().trim();

            if (title && link) {
                // Ensure absolute URL
                if (!link.startsWith("http")) {
                    link = new URL(link, BASE_URL).href;
                }

                // Fetch description from article page
                const description = await fetchArticleDescription(link);

                articles.push({ title, link, imageUrl, description, tags: [tag], date });
            }
        }).get();

        await Promise.all(articlePromises);

        console.log("Latest Articles:", articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
    }
    return articles;
}

// export const scrapeGoodNews = async () => {
//     try {
//         // Fetch the HTML content of the homepage
//         const { data } = await axios.get(URL);
//         const $ = cheerio.load(data); 
//         const articles = [];

//         // Select each article block
//         $(".td_module_wrap").each(async(index, element) => {
//             const title = $(element).find(".entry-title a").text().trim();
//             const link = $(element).find(".td-module-thumb a").attr("href");
//             const imageUrl = $(element).find(".td-module-thumb a img").attr("src");
//             const tag = $(element).find(".td-module-meta-info .float-right a").text().trim();
//             const description = await fetchArticleDescription(link)
//             if (title && link && imageUrl) {
//                 articles.push({ title, link, imageUrl, tags: [tag], description });
//             }
//         });

//         console.log(articles);
//         return articles;
//     } catch (error) {
//         console.error("Error scraping Good News Network:", error);
//     }
// }


async function fetchArticleDescription(articleUrl) {
    try {
        const { data } = await axios.get(articleUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);

        // Extract all paragraphs inside <article>
        const description = $("article p")
            .map((i, el) => $(el).text().trim())
            .get()
            .join("\n\n"); // Join paragraphs with spacing

        return description || "No description available";
    } catch (error) {
        console.error(`Error fetching description for ${articleUrl}:`, error);
        return "Failed to fetch description";
    }
}

// Run the scraper
// fetchLatestArticles();